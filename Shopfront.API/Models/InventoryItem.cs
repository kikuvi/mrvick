namespace Shopfront.API.Models;

public class InventoryItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string TrackingToken { get; set; } = string.Empty;
    public string ProductTitle { get; set; } = string.Empty;
    public string? Variation { get; set; }
    public decimal BuyingPrice { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsMoved { get; set; } = false;
    public DateTime? MovedAt { get; set; }

    public Order Order { get; set; } = null!;
    public InventoryMovement? Movement { get; set; }
}
