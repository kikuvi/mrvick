using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Data;

namespace Shopfront.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly ShopfrontDbContext _db;

    public NotificationsController(ShopfrontDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetRecent()
    {
        var items = await _db.AppNotifications
            .OrderByDescending(n => n.CreatedAt)
            .Take(30)
            .Select(n => new
            {
                n.Id,
                n.Title,
                n.Message,
                n.OrderId,
                n.IsRead,
                n.CreatedAt
            })
            .ToListAsync();

        var unreadCount = await _db.AppNotifications.CountAsync(n => !n.IsRead);

        return Ok(new { items, unreadCount });
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var n = await _db.AppNotifications.FindAsync(id);
        if (n is null) return NotFound();
        n.IsRead = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        await _db.AppNotifications
            .Where(n => !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
        return NoContent();
    }
}
