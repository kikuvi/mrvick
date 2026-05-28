using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Authorization;
using Shopfront.API.DTOs;
using Shopfront.API.Models;
using Shopfront.API.Services;

namespace Shopfront.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly AuditService _audit;
    private readonly INotificationService _notifications;

    public UsersController(UserManager<AppUser> userManager, AuditService audit, INotificationService notifications)
    {
        _userManager = userManager;
        _audit = audit;
        _notifications = notifications;
    }

    [HttpGet("lookup")]
    public async Task<IActionResult> Lookup()
    {
        var users = await _userManager.Users
            .Where(u => u.IsActive)
            .OrderBy(u => u.FullName)
            .Select(u => new { u.Id, u.FullName })
            .ToListAsync();

        return Ok(users);
    }

    [Authorize(Policy = Permissions.ViewUsers)]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userManager.Users
            .OrderBy(u => u.Email)
            .Select(u => new UserDto(u.Id, u.Email!, u.FullName, u.PhoneNumber, u.EmailConfirmed, u.MustChangePassword, u.IsActive))
            .ToListAsync();

        return Ok(users);
    }

    [Authorize(Policy = Permissions.ManageUsers)]
    [HttpPost]
    public async Task<IActionResult> Create(CreateUserDto dto)
    {
        var existing = await _userManager.FindByEmailAsync(dto.Email);
        if (existing is not null)
            return BadRequest(new { error = "A user with that email already exists." });

        var password = GeneratePassword();

        var user = new AppUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            EmailConfirmed = true,
            FullName = dto.FullName.Trim(),
            PhoneNumber = dto.PhoneNumber?.Trim(),
            MustChangePassword = true
        };

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { error = errors });
        }

        _ = Task.Run(async () =>
        {
            await _notifications.SendEmailAsync(dto.Email, "Your Shopfront Admin Account",
                $@"<p>Hi {user.FullName},</p>
                   <p>An admin account has been created for you on Shopfront.</p>
                   <table style='border-collapse:collapse;margin:16px 0;'>
                     <tr><td style='padding:6px 16px 6px 0;color:#555;'>Email</td><td style='font-weight:700;'>{dto.Email}</td></tr>
                     <tr><td style='padding:6px 16px 6px 0;color:#555;'>Password</td><td style='font-family:monospace;font-size:1.1em;font-weight:700;letter-spacing:2px;'>{password}</td></tr>
                   </table>
                   <p>Please log in and change your password immediately.</p>");
        });

        var actorEmail = User.FindFirstValue(ClaimTypes.Email);
        await _audit.LogAsync("UserCreated", actorEmail, "User", user.Id, user.Email);
        return Ok(new UserDto(user.Id, user.Email!, user.FullName, user.PhoneNumber, user.EmailConfirmed, user.MustChangePassword, user.IsActive));
    }

    private static string GeneratePassword()
    {
        const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string lower = "abcdefghjkmnpqrstuvwxyz";
        const string digits = "23456789";
        const string special = "!@#$%";
        var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        var all = upper + lower + digits + special;
        // Guarantee at least one of each required character class
        var chars = new char[8];
        chars[0] = Pick(rng, upper);
        chars[1] = Pick(rng, lower);
        chars[2] = Pick(rng, digits);
        chars[3] = Pick(rng, special);
        for (int i = 4; i < 8; i++) chars[i] = Pick(rng, all);
        // Shuffle
        for (int i = 7; i > 0; i--)
        {
            var j = (int)(NextByte(rng) % (i + 1));
            (chars[i], chars[j]) = (chars[j], chars[i]);
        }
        return new string(chars);
    }

    private static char Pick(System.Security.Cryptography.RandomNumberGenerator rng, string chars)
        => chars[NextByte(rng) % chars.Length];

    private static byte NextByte(System.Security.Cryptography.RandomNumberGenerator rng)
    {
        var buf = new byte[1];
        rng.GetBytes(buf);
        return buf[0];
    }

    [Authorize(Policy = Permissions.ManageUsers)]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, UpdateUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null) return NotFound();

        // Check email not taken by another user
        if (!string.Equals(user.Email, dto.Email, StringComparison.OrdinalIgnoreCase))
        {
            var existing = await _userManager.FindByEmailAsync(dto.Email);
            if (existing is not null)
                return BadRequest(new { error = "That email is already in use." });
            user.UserName = dto.Email;
            user.Email = dto.Email;
            user.NormalizedEmail = dto.Email.ToUpperInvariant();
            user.NormalizedUserName = dto.Email.ToUpperInvariant();
        }

        user.FullName = dto.FullName.Trim();
        user.PhoneNumber = dto.PhoneNumber?.Trim();

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { error = errors });
        }

        var actorEmail = User.FindFirstValue(ClaimTypes.Email);
        await _audit.LogAsync("UserUpdated", actorEmail, "User", user.Id, user.Email);
        return Ok(new UserDto(user.Id, user.Email!, user.FullName, user.PhoneNumber, user.EmailConfirmed, user.MustChangePassword, user.IsActive));
    }

    [Authorize(Policy = Permissions.ManageUsers)]
    [HttpPut("{id}/password")]
    public async Task<IActionResult> UpdatePassword(string id, UpdatePasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null) return NotFound();

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { error = errors });
        }

        // Admin-reset password: mark user must change on next login
        user.MustChangePassword = true;
        await _userManager.UpdateAsync(user);

        var actorEmail = User.FindFirstValue(ClaimTypes.Email);
        await _audit.LogAsync("PasswordReset", actorEmail, "User", id, user.Email);
        return NoContent();
    }

    [Authorize(Policy = Permissions.ManageUsers)]
    [HttpPatch("{id}/toggle-active")]
    public async Task<IActionResult> ToggleActive(string id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (id == currentUserId)
            return BadRequest(new { error = "You cannot deactivate your own account." });

        var user = await _userManager.FindByIdAsync(id);
        if (user is null) return NotFound();

        user.IsActive = !user.IsActive;
        await _userManager.UpdateAsync(user);
        var actorEmail = User.FindFirstValue(ClaimTypes.Email);
        await _audit.LogAsync(user.IsActive ? "UserActivated" : "UserDeactivated", actorEmail, "User", user.Id, user.Email);
        return Ok(new UserDto(user.Id, user.Email!, user.FullName, user.PhoneNumber, user.EmailConfirmed, user.MustChangePassword, user.IsActive));
    }

    [Authorize(Policy = Permissions.ManageUsers)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (id == currentUserId)
            return BadRequest(new { error = "You cannot delete your own account." });

        var user = await _userManager.FindByIdAsync(id);
        if (user is null) return NotFound();

        await _userManager.DeleteAsync(user);
        return NoContent();
    }
}
