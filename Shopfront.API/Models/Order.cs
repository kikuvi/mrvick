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
    public Guid Id { get; set; }
    public string TrackingToken { get; set; } = string.Empty;
    public Guid ProductId { get; set; }

    public string CustomerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string County { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public string? Variation { get; set; }

    public decimal PriceAtOrder { get; set; }
    public decimal BuyingPrice { get; set; }
    public decimal AdvertisingCost { get; set; }
    public decimal DeliveryFee { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.New;
    public bool IsArchived { get; set; } = false;
    public Guid? RiderId { get; set; }
    public Guid? CourierId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Product Product { get; set; } = null!;
    public Rider? Rider { get; set; }
    public Courier? Courier { get; set; }
}
