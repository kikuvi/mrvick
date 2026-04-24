using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Data;
using Shopfront.API.DTOs;
using Shopfront.API.Models;

namespace Shopfront.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RidersController : ControllerBase
{
    private readonly ShopfrontDbContext _db;

    public RidersController(ShopfrontDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var riders = await _db.Riders
            .OrderBy(r => r.Name)
            .Select(r => new RiderDto(r.Id, r.Name, r.Phone, r.County, r.LocalTown, r.CreatedAt))
            .ToListAsync();

        return Ok(riders);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateRiderDto dto)
    {
        var rider = new Rider
        {
            Name = dto.Name,
            Phone = dto.Phone,
            County = dto.County,
            LocalTown = dto.LocalTown
        };

        _db.Riders.Add(rider);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new RiderDto(
            rider.Id, rider.Name, rider.Phone, rider.County, rider.LocalTown, rider.CreatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var rider = await _db.Riders.FindAsync(id);
        if (rider is null) return NotFound();

        _db.Riders.Remove(rider);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
