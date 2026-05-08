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
public class VendorItemsController : ControllerBase
{
    private readonly ShopfrontDbContext _db;

    public VendorItemsController(ShopfrontDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _db.VendorItems
            .OrderByDescending(v => v.CreatedAt)
            .Select(v => new VendorItemDto(v.Id, v.ItemName, v.Vendor, v.Location, v.Price, v.Contacts, v.CreatedAt))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> Create(SaveVendorItemDto dto)
    {
        var item = new VendorItem
        {
            ItemName = dto.ItemName,
            Vendor   = dto.Vendor,
            Location = dto.Location,
            Price    = dto.Price,
            Contacts = dto.Contacts
        };

        _db.VendorItems.Add(item);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = item.Id },
            new VendorItemDto(item.Id, item.ItemName, item.Vendor, item.Location, item.Price, item.Contacts, item.CreatedAt));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, SaveVendorItemDto dto)
    {
        var item = await _db.VendorItems.FindAsync(id);
        if (item is null) return NotFound();

        item.ItemName = dto.ItemName;
        item.Vendor   = dto.Vendor;
        item.Location = dto.Location;
        item.Price    = dto.Price;
        item.Contacts = dto.Contacts;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _db.VendorItems.FindAsync(id);
        if (item is null) return NotFound();

        _db.VendorItems.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
