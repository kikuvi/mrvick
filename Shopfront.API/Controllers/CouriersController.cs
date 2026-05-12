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

    [HttpGet("offices")]
    public async Task<IActionResult> GetOffices()
    {
        var offices = await _db.CourierOffices
            .Include(o => o.Courier)
            .OrderBy(o => o.Courier.Name).ThenBy(o => o.Office)
            .Select(o => new { o.Id, o.CourierId, CourierName = o.Courier.Name, o.Office, o.Phone, o.CreatedAt })
            .ToListAsync();
        return Ok(offices);
    }

    [HttpPost("offices")]
    public async Task<IActionResult> CreateOffice([FromBody] CreateOfficeRequest dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Office) || string.IsNullOrWhiteSpace(dto.Phone))
            return BadRequest("Office and phone are required.");

        var courier = await _db.Couriers.FindAsync(dto.CourierId);
        if (courier is null) return BadRequest("Courier not found.");

        var office = new CourierOffice
        {
            CourierId = dto.CourierId,
            Office    = dto.Office.Trim(),
            Phone     = dto.Phone.Trim()
        };
        _db.CourierOffices.Add(office);
        await _db.SaveChangesAsync();
        return Ok(new { office.Id, office.CourierId, CourierName = courier.Name, office.Office, office.Phone, office.CreatedAt });
    }

    [HttpDelete("offices/{id}")]
    public async Task<IActionResult> DeleteOffice(Guid id)
    {
        var office = await _db.CourierOffices.FindAsync(id);
        if (office is null) return NotFound();
        _db.CourierOffices.Remove(office);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateCourierRequest(string Name);
public record CreateOfficeRequest(Guid CourierId, string Office, string Phone);
