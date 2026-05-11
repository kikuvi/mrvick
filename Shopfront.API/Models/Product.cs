namespace Shopfront.API.Models;

public class Product
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal DiscountPrice { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;
    public bool RatingsEnabled { get; set; } = false;
    public int Views { get; set; } = 0;

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductVariation> Variations { get; set; } = new List<ProductVariation>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<ProductRating> Ratings { get; set; } = new List<ProductRating>();
}
