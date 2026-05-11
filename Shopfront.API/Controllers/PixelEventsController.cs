using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Data;
using Shopfront.API.DTOs;
using Shopfront.API.Models;

namespace Shopfront.API.Controllers;

[ApiController]
[Route("api/pixel-events")]
public class PixelEventsController : ControllerBase
{
    private readonly ShopfrontDbContext _db;

    public PixelEventsController(ShopfrontDbContext db) => _db = db;

    // Called by the Angular pixel service each time a browser pixel event fires
    [HttpPost]
    public async Task<IActionResult> Log(LogPixelEventDto dto)
    {
        _db.PixelEvents.Add(new PixelEvent
        {
            EventName = dto.EventName,
            Source    = "Pixel",
            EventId   = dto.EventId,
            ProductId = dto.ProductId,
            Value     = dto.Value,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
        return Ok();
    }

    // Returns per-event coverage breakdown for the admin UI
    [HttpGet("coverage")]
    public async Task<IActionResult> Coverage([FromQuery] int days = 30)
    {
        var since = DateTime.UtcNow.AddDays(-days);

        var grouped = await _db.PixelEvents
            .Where(e => e.CreatedAt >= since)
            .GroupBy(e => new { e.EventName, e.Source })
            .Select(g => new { g.Key.EventName, g.Key.Source, Count = g.Count() })
            .ToListAsync();

        var rows = grouped
            .GroupBy(e => e.EventName)
            .Select(g => new PixelCoverageRow(
                g.Key,
                g.FirstOrDefault(e => e.Source == "Pixel")?.Count ?? 0,
                g.FirstOrDefault(e => e.Source == "CAPI")?.Count  ?? 0
            ))
            .OrderByDescending(r => r.PixelCount + r.CapiCount)
            .ToList();

        return Ok(rows);
    }
}
