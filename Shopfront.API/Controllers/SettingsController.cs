using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Data;

namespace Shopfront.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly ShopfrontDbContext _db;

    public SettingsController(ShopfrontDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var settings = await _db.SiteSettings.ToListAsync();
        var result = settings.ToDictionary(s => s.Key, s => s.Value);
        return Ok(result);
    }

    [Authorize]
    [HttpPatch]
    public async Task<IActionResult> Update([FromBody] Dictionary<string, string> updates)
    {
        foreach (var (key, value) in updates)
        {
            var setting = await _db.SiteSettings.FirstOrDefaultAsync(s => s.Key == key);
            if (setting is not null)
            {
                setting.Value = value;
                setting.UpdatedAt = NairobiClock.Now;
            }
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
