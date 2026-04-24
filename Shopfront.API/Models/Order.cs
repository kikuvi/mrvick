namespace Shopfront.API.Models;

public enum OrderStatus
{
    New,
    Assigned,
    InTransit,
    Delivered,
    Rejected
}

public class Order
{
    public int Id { get; set; }
    public string TrackingToken { get; set; } = string.Empty;
    public int ProductId { get; set; }

    public string CustomerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string County { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;

    public decimal PriceAtOrder { get; set; }
    public decimal AdvertisingCost { get; set; }
    public decimal DeliveryFee { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.New;
    public int? RiderId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Product Product { get; set; } = null!;
    public Rider? Rider { get; set; }
}
