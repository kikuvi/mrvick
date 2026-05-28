using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Authorization;
using Shopfront.API.Data;
using Shopfront.API.DTOs;
using Shopfront.API.Models;
using Shopfront.API.Services;

namespace Shopfront.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly ShopfrontDbContext _db;
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly AuditService _audit;

    public InventoryController(ShopfrontDbContext db, UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, AuditService audit)
    {
        _db = db;
        _userManager = userManager;
        _signInManager = signInManager;
        _audit = audit;
    }

    [Authorize(Policy = Permissions.ViewInventory)]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _db.InventoryItems
            .Include(i => i.Movement)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new InventoryItemDto(
                i.Id,
                i.OrderId,
                i.TrackingToken,
                i.ProductTitle,
                i.Variation,
                i.BuyingPrice,
                i.Notes,
                i.CreatedAt,
                i.IsMoved,
                i.MovedAt,
                i.Movement == null ? null : new InventoryMovementDto(
                    i.Movement.Id,
                    i.Movement.Reason,
                    i.Movement.FulfillmentNote,
                    i.Movement.MovedByEmail,
                    i.Movement.ApprovedByEmail,
                    i.Movement.MovedAt
                )
            ))
            .ToListAsync();

        return Ok(items);
    }

    [Authorize(Policy = Permissions.ManageInventory)]
    [HttpPost("{id}/move")]
    public async Task<IActionResult> Move(Guid id, MoveFromInventoryDto dto)
    {
        var item = await _db.InventoryItems.Include(i => i.Movement).FirstOrDefaultAsync(i => i.Id == id);
        if (item is null) return NotFound();
        if (item.IsMoved) return BadRequest(new { error = "This item has already been moved." });

        var approver = await _userManager.FindByEmailAsync(dto.ApproverEmail);
        if (approver is null)
            return BadRequest(new { error = "Second approver not found." });

        var check = await _signInManager.CheckPasswordSignInAsync(approver, dto.ApproverPassword, lockoutOnFailure: false);
        if (!check.Succeeded)
            return BadRequest(new { error = "Invalid second approver credentials." });

        var actorEmail = User.FindFirstValue(ClaimTypes.Email)!;
        if (string.Equals(actorEmail, dto.ApproverEmail, StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { error = "The second approver must be a different user." });

        var movement = new InventoryMovement
        {
            InventoryItemId = item.Id,
            Reason = dto.Reason.Trim(),
            FulfillmentNote = dto.FulfillmentNote?.Trim(),
            MovedByEmail = actorEmail,
            ApprovedByEmail = approver.Email!,
            MovedAt = DateTime.UtcNow
        };

        item.IsMoved = true;
        item.MovedAt = movement.MovedAt;

        _db.InventoryMovements.Add(movement);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("InventoryItemMoved", actorEmail, "InventoryItem", item.Id.ToString(),
            $"{item.ProductTitle} — {dto.Reason} (approved by {approver.Email})");

        return Ok(new InventoryMovementDto(
            movement.Id, movement.Reason, movement.FulfillmentNote,
            movement.MovedByEmail, movement.ApprovedByEmail, movement.MovedAt
        ));
    }
}
