using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Data;
using Shopfront.API.DTOs;
using Shopfront.API.Models;

namespace Shopfront.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ShopfrontDbContext _db;

    public ProductsController(ShopfrontDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await _db.Products
            .Include(p => p.Images)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProductDto(
                p.Id, p.Title, p.Description, p.Price, p.DiscountPrice, p.CreatedAt,
                p.Images.Select(i => i.ImageUrl).ToList()
            ))
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _db.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product is null) return NotFound();

        return Ok(new ProductDto(
            product.Id, product.Title, product.Description,
            product.Price, product.DiscountPrice, product.CreatedAt,
            product.Images.Select(i => i.ImageUrl).ToList()
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
            Images = dto.ImageUrls.Select(url => new ProductImage { ImageUrl = url }).ToList()
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = product.Id },
            new ProductDto(product.Id, product.Title, product.Description,
                product.Price, product.DiscountPrice, product.CreatedAt,
                product.Images.Select(i => i.ImageUrl).ToList()));
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateProductDto dto)
    {
        var product = await _db.Products
            .Include(p => p.Images)
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

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
