using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Data;
using Shopfront.API.DTOs;

namespace Shopfront.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PagesController : ControllerBase
{
    private readonly ShopfrontDbContext _db;

    public PagesController(ShopfrontDbContext db) => _db = db;

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var page = await _db.Pages.FirstOrDefaultAsync(p => p.Slug == slug);
        if (page is null) return NotFound();

        return Ok(new PageDto(page.Id, page.Slug, page.Title, page.Content, page.MetaDesc, page.UpdatedAt));
    }

    [Authorize]
    [HttpPatch("{slug}")]
    public async Task<IActionResult> Update(string slug, UpdatePageDto dto)
    {
        var page = await _db.Pages.FirstOrDefaultAsync(p => p.Slug == slug);
        if (page is null) return NotFound();

        page.Title = dto.Title;
        page.Content = dto.Content;
        page.MetaDesc = dto.MetaDesc;
        page.UpdatedAt = NairobiClock.Now;

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
