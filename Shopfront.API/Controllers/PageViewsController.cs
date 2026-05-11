using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Data;
using Shopfront.API.Models;

namespace Shopfront.API.Controllers;

[ApiController]
[Route("api/page-views")]
public class PageViewsController : ControllerBase
{
    private readonly ShopfrontDbContext _db;

    public PageViewsController(ShopfrontDbContext db) => _db = db;

    [HttpPost]
    public async Task<IActionResult> Track([FromBody] TrackPageViewDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Path)) return BadRequest();

        var path = dto.Path.Trim().ToLowerInvariant();
        if (path.Length > 500) path = path[..500];

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var existing = await _db.PageViews
            .FirstOrDefaultAsync(p => p.Path == path && p.Date == today);

        if (existing != null)
            existing.Count++;
        else
            _db.PageViews.Add(new PageView { Path = path, Date = today, Count = 1 });

        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("report")]
    [Authorize]
    public async Task<IActionResult> GetReport([FromQuery] int days = 30)
    {
        var since = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-(days - 1)));
        var rows = await _db.PageViews
            .Where(p => p.Date >= since)
            .OrderByDescending(p => p.Date)
            .ThenByDescending(p => p.Count)
            .Select(p => new { p.Path, Date = p.Date.ToString(), p.Count })
            .ToListAsync();

        return Ok(rows);
    }
}

public record TrackPageViewDto(string Path);
