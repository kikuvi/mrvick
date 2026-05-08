namespace Shopfront.API.Models;

public class ProductVariation
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string Label { get; set; } = string.Empty;

    public Product Product { get; set; } = null!;
}
