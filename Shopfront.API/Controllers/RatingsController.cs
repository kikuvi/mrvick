using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Data;
using Shopfront.API.DTOs;
using Shopfront.API.Models;

namespace Shopfront.API.Controllers;

[ApiController]
[Route("api")]
public class RatingsController : ControllerBase
{
    private readonly ShopfrontDbContext _db;

    public RatingsController(ShopfrontDbContext db) => _db = db;

    // Public: submit a rating for a product
    [HttpPost("products/{productId}/ratings")]
    public async Task<IActionResult> Submit(Guid productId, SubmitRatingDto dto)
    {
        var product = await _db.Products.FindAsync(productId);
        if (product is null) return NotFound();
        if (!product.RatingsEnabled) return BadRequest("Ratings are not enabled for this product.");
        if (dto.Rating < 1 || dto.Rating > 5) return BadRequest("Rating must be between 1 and 5.");

        var rating = new ProductRating
        {
            ProductId = productId,
            CustomerName = dto.CustomerName.Trim(),
            Rating = dto.Rating,
            Comment = dto.Comment.Trim(),
            IsApproved = false
        };

        _db.ProductRatings.Add(rating);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Thank you! Your review will appear after approval." });
    }

    // Public: get approved ratings for a product
    [HttpGet("products/{productId}/ratings")]
    public async Task<IActionResult> GetForProduct(Guid productId)
    {
        var ratings = await _db.ProductRatings
            .Where(r => r.ProductId == productId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new RatingDto(r.Id, r.CustomerName, r.Rating, r.Comment, r.IsApproved, r.CreatedAt, r.ProductId, r.Product.Title))
            .ToListAsync();

        return Ok(ratings);
    }

    // Get all ratings — public when approved=true, admin usage for pending
    [HttpGet("ratings")]
    public async Task<IActionResult> GetAll([FromQuery] bool? approved = null)
    {
        var query = _db.ProductRatings.Include(r => r.Product).AsQueryable();
        if (approved.HasValue) query = query.Where(r => r.IsApproved == approved.Value);

        var ratings = await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new RatingDto(r.Id, r.CustomerName, r.Rating, r.Comment, r.IsApproved, r.CreatedAt, r.ProductId, r.Product.Title))
            .ToListAsync();

        return Ok(ratings);
    }

    // Admin: approve a rating
    [Authorize]
    [HttpPatch("ratings/{id}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var rating = await _db.ProductRatings.FindAsync(id);
        if (rating is null) return NotFound();
        rating.IsApproved = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Admin: delete a rating
    [Authorize]
    [HttpDelete("ratings/{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var rating = await _db.ProductRatings.FindAsync(id);
        if (rating is null) return NotFound();
        _db.ProductRatings.Remove(rating);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
