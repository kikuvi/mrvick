using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Authorization;
using Shopfront.API.Data;
using Shopfront.API.Models;

namespace Shopfront.API.Controllers;

[Authorize(Policy = Permissions.ManagePermissions)]
[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly ShopfrontDbContext _db;
    private readonly UserManager<AppUser> _userManager;

    public RolesController(ShopfrontDbContext db, UserManager<AppUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    // GET /api/roles
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var roles = await _db.AppRoles
            .Include(r => r.Permissions)
            .Include(r => r.UserRoles)
            .OrderBy(r => r.Name)
            .Select(r => new RoleDto(
                r.Id,
                r.Name,
                r.Description,
                r.Permissions.Select(p => p.Permission).ToList(),
                r.UserRoles.Count,
                r.CreatedAt))
            .ToListAsync();

        return Ok(roles);
    }

    // POST /api/roles
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRoleDto dto)
    {
        if (await _db.AppRoles.AnyAsync(r => r.Name == dto.Name.Trim()))
            return BadRequest(new { error = "A role with that name already exists." });

        var role = new AppRole
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim()
        };

        _db.AppRoles.Add(role);
        await _db.SaveChangesAsync();

        return Ok(new RoleDto(role.Id, role.Name, role.Description, [], 0, role.CreatedAt));
    }

    // PUT /api/roles/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoleDto dto)
    {
        var role = await _db.AppRoles.FindAsync(id);
        if (role is null) return NotFound();

        if (await _db.AppRoles.AnyAsync(r => r.Name == dto.Name.Trim() && r.Id != id))
            return BadRequest(new { error = "A role with that name already exists." });

        role.Name = dto.Name.Trim();
        role.Description = dto.Description?.Trim();
        await _db.SaveChangesAsync();

        return Ok(new RoleDto(role.Id, role.Name, role.Description, [], 0, role.CreatedAt));
    }

    // DELETE /api/roles/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var role = await _db.AppRoles.FindAsync(id);
        if (role is null) return NotFound();

        _db.AppRoles.Remove(role);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // GET /api/roles/{id}/permissions
    [HttpGet("{id:guid}/permissions")]
    public async Task<IActionResult> GetPermissions(Guid id)
    {
        var perms = await _db.RolePermissions
            .Where(rp => rp.RoleId == id)
            .Select(rp => rp.Permission)
            .ToListAsync();

        return Ok(perms);
    }

    // PUT /api/roles/{id}/permissions
    [HttpPut("{id:guid}/permissions")]
    public async Task<IActionResult> SetPermissions(Guid id, [FromBody] SetRolePermissionsDto dto)
    {
        var role = await _db.AppRoles.FindAsync(id);
        if (role is null) return NotFound();

        // Validate that all supplied permissions are known
        var known = new HashSet<string>(Permissions.All);
        var invalid = dto.Permissions.Where(p => !known.Contains(p)).ToList();
        if (invalid.Count > 0)
            return BadRequest(new { error = $"Unknown permissions: {string.Join(", ", invalid)}" });

        // Replace all permissions for this role
        var existing = await _db.RolePermissions.Where(rp => rp.RoleId == id).ToListAsync();
        _db.RolePermissions.RemoveRange(existing);

        var newPerms = dto.Permissions.Distinct().Select(p => new RolePermission
        {
            RoleId = id,
            Permission = p
        });
        _db.RolePermissions.AddRange(newPerms);

        await _db.SaveChangesAsync();

        return Ok(dto.Permissions.Distinct().ToList());
    }

    // GET /api/roles/{id}/users
    [HttpGet("{id:guid}/users")]
    public async Task<IActionResult> GetUsers(Guid id)
    {
        var users = await _db.AppUserRoles
            .Where(ur => ur.RoleId == id)
            .Include(ur => ur.User)
            .Select(ur => new { ur.User.Id, ur.User.Email, ur.User.FullName })
            .ToListAsync();

        return Ok(users);
    }

    // PUT /api/roles/users/{userId}  — set roles for a user
    [HttpPut("users/{userId}")]
    public async Task<IActionResult> SetUserRoles(string userId, [FromBody] SetUserRolesDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) return NotFound();

        // Validate role IDs exist
        var allRoleIds = await _db.AppRoles.Select(r => r.Id).ToListAsync();
        var invalid = dto.RoleIds.Where(id => !allRoleIds.Contains(id)).ToList();
        if (invalid.Count > 0)
            return BadRequest(new { error = "Some role IDs are invalid." });

        // Replace user's roles
        var existing = await _db.AppUserRoles.Where(ur => ur.UserId == userId).ToListAsync();
        _db.AppUserRoles.RemoveRange(existing);

        var newRoles = dto.RoleIds.Distinct().Select(rid => new UserRole
        {
            UserId = userId,
            RoleId = rid
        });
        _db.AppUserRoles.AddRange(newRoles);

        await _db.SaveChangesAsync();

        return Ok(dto.RoleIds.Distinct().ToList());
    }

    // GET /api/roles/users/{userId} — get roles for a user
    [HttpGet("users/{userId}")]
    public async Task<IActionResult> GetUserRoles(string userId)
    {
        var roles = await _db.AppUserRoles
            .Where(ur => ur.UserId == userId)
            .Include(ur => ur.Role)
            .Select(ur => new { ur.Role.Id, ur.Role.Name, ur.Role.Description })
            .ToListAsync();

        return Ok(roles);
    }
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public record RoleDto(Guid Id, string Name, string? Description, List<string> Permissions, int UserCount, DateTime CreatedAt);
public record CreateRoleDto(string Name, string? Description);
public record UpdateRoleDto(string Name, string? Description);
public record SetRolePermissionsDto(List<string> Permissions);
public record SetUserRolesDto(List<Guid> RoleIds);
