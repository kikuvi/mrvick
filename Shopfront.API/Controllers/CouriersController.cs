using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Data;
using Shopfront.API.Models;

namespace Shopfront.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CouriersController : ControllerBase
{
    private readonly ShopfrontDbContext _db;

    public CouriersController(ShopfrontDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var couriers = await _db.Couriers
            .OrderBy(c => c.Name)
            .Select(c => new { c.Id, c.Name, c.CreatedAt })
            .ToListAsync();
        return Ok(couriers);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCourierRequest dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name is required.");

        var courier = new Courier { Name = dto.Name.Trim() };
        _db.Couriers.Add(courier);
        await _db.SaveChangesAsync();
        return Ok(new { courier.Id, courier.Name, courier.CreatedAt });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var courier = await _db.Couriers.FindAsync(id);
        if (courier is null) return NotFound();
        _db.Couriers.Remove(courier);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateCourierRequest(string Name);
