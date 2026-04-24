using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Shopfront.API.DTOs;
using Shopfront.API.Services;

namespace Shopfront.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IConfiguration _config;
    private readonly INotificationService _notifications;

    public AuthController(UserManager<IdentityUser> userManager, IConfiguration config, INotificationService notifications)
    {
        _userManager = userManager;
        _config = config;
        _notifications = notifications;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            return Unauthorized("Invalid email or password.");

        var token = GenerateJwtToken(user);
        return Ok(new AuthResponseDto(token, user.Email!));
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);

        // Always return OK to avoid email enumeration
        if (user is null) return Ok(new { message = "If that email exists, a reset link has been sent." });

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);
        var encodedEmail = Uri.EscapeDataString(dto.Email);

        var baseUrl = _config["App:BaseUrl"] ?? "http://localhost:4200";
        var resetLink = $"{baseUrl}/admin/reset-password?email={encodedEmail}&token={encodedToken}";

        await _notifications.SendEmailAsync(
            dto.Email,
            "Reset your Shopfront Admin password",
            $@"<h2>Password Reset</h2>
               <p>Click the link below to reset your password. This link is valid for a limited time.</p>
               <p><a href=""{resetLink}"" style=""background:#1d3557;color:#fff;padding:.6rem 1.25rem;border-radius:6px;text-decoration:none;font-weight:700"">Reset Password</a></p>
               <p>If you did not request this, please ignore this email.</p>"
        );

        return Ok(new { message = "If that email exists, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user is null) return BadRequest(new { error = "Invalid request." });

        var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { error = errors });
        }

        return Ok(new { message = "Password reset successfully." });
    }

    private string GenerateJwtToken(IdentityUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email!),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
