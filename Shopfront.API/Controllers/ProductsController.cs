using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Data;
using Shopfront.API.DTOs;
using Shopfront.API.Models;
using Shopfront.API.Services;

namespace Shopfront.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ShopfrontDbContext _db;
    private readonly AuditService _audit;

    public ProductsController(ShopfrontDbContext db, AuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    // Public: active products only
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await _db.Products
            .Include(p => p.Images)
            .Include(p => p.Variations)
            .Include(p => p.Ratings)
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => ToDto(p))
            .ToListAsync();

        return Ok(products);
    }

    // Admin: all products including inactive
    [Authorize]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllAdmin()
    {
        var products = await _db.Products
            .Include(p => p.Images)
            .Include(p => p.Variations)
            .Include(p => p.Ratings)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => ToDto(p))
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var product = await _db.Products
            .Include(p => p.Images)
            .Include(p => p.Variations)
            .Include(p => p.Ratings)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product is null) return NotFound();

        await _db.Products
            .Where(p => p.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.Views, x => x.Views + 1));

        var approvedRatings = product.Ratings.Where(r => r.IsApproved).ToList();
        return Ok(new ProductDto(
            product.Id, product.Title, product.Description,
            product.Price, product.DiscountPrice, product.CreatedAt,
            product.Images.Select(i => i.ImageUrl).ToList(),
            product.Variations.Select(v => new VariationDto(v.Id, v.Label)).ToList(),
            product.RatingsEnabled,
            approvedRatings.Any() ? approvedRatings.Average(r => r.Rating) : 0,
            approvedRatings.Count,
            product.IsActive,
            product.Views + 1
        ));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(CreateProductDto dto)
    {
        var product = new Product
        {
            Title = dto.Title,
            Description = dto.Description,
            Price = dto.Price,
            DiscountPrice = dto.DiscountPrice,
            RatingsEnabled = dto.RatingsEnabled,
            IsActive = true,
            Images = dto.ImageUrls.Select(url => new ProductImage { ImageUrl = url }).ToList(),
            Variations = (dto.Variations ?? [])
                .Where(l => !string.IsNullOrWhiteSpace(l))
                .Select(l => new ProductVariation { Label = l.Trim() })
                .ToList()
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var actorEmail = User.FindFirstValue(System.Security.Claims.ClaimTypes.Email);
        await _audit.LogAsync("ProductCreated", actorEmail, "Product", product.Id.ToString(), product.Title);

        return CreatedAtAction(nameof(GetById), new { id = product.Id },
            new ProductDto(product.Id, product.Title, product.Description,
                product.Price, product.DiscountPrice, product.CreatedAt,
                product.Images.Select(i => i.ImageUrl).ToList(),
                product.Variations.Select(v => new VariationDto(v.Id, v.Label)).ToList(),
                product.RatingsEnabled, 0, 0, product.IsActive, 0));
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateProductDto dto)
    {
        var product = await _db.Products
            .Include(p => p.Images)
            .Include(p => p.Variations)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (product is null) return NotFound();

        if (dto.Title is not null) product.Title = dto.Title;
        if (dto.Description is not null) product.Description = dto.Description;
        if (dto.Price is not null) product.Price = dto.Price.Value;
        if (dto.DiscountPrice is not null) product.DiscountPrice = dto.DiscountPrice.Value;

        if (dto.ImageUrls is not null)
        {
            _db.RemoveRange(product.Images);
            product.Images = dto.ImageUrls
                .Select(url => new ProductImage { ImageUrl = url })
                .ToList();
        }

        if (dto.Variations is not null)
        {
            _db.RemoveRange(product.Variations);
            product.Variations = dto.Variations
                .Where(l => !string.IsNullOrWhiteSpace(l))
                .Select(l => new ProductVariation { Label = l.Trim() })
                .ToList();
        }

        if (dto.RatingsEnabled is not null) product.RatingsEnabled = dto.RatingsEnabled.Value;

        await _db.SaveChangesAsync();
        var actorEmail = User.FindFirstValue(System.Security.Claims.ClaimTypes.Email);
        await _audit.LogAsync("ProductUpdated", actorEmail, "Product", id.ToString(), product.Title);
        return NoContent();
    }

    // Toggle active/inactive
    [Authorize]
    [HttpPatch("{id}/toggle-active")]
    public async Task<IActionResult> ToggleActive(Guid id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        product.IsActive = !product.IsActive;
        await _db.SaveChangesAsync();
        var actorEmail = User.FindFirstValue(System.Security.Claims.ClaimTypes.Email);
        await _audit.LogAsync(product.IsActive ? "ProductActivated" : "ProductDeactivated", actorEmail, "Product", id.ToString(), product.Title);
        return Ok(new { isActive = product.IsActive });
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        var title = product.Title;
        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
        var actorEmail = User.FindFirstValue(System.Security.Claims.ClaimTypes.Email);
        await _audit.LogAsync("ProductDeleted", actorEmail, "Product", id.ToString(), title);
        return NoContent();
    }

    private static ProductDto ToDto(Product p) => new(
        p.Id, p.Title, p.Description, p.Price, p.DiscountPrice, p.CreatedAt,
        p.Images.Select(i => i.ImageUrl).ToList(),
        p.Variations.Select(v => new VariationDto(v.Id, v.Label)).ToList(),
        p.RatingsEnabled,
        p.Ratings.Any(r => r.IsApproved) ? p.Ratings.Where(r => r.IsApproved).Average(r => r.Rating) : 0,
        p.Ratings.Count(r => r.IsApproved),
        p.IsActive,
        p.Views
    );
}
