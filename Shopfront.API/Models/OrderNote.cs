namespace Shopfront.API.Models;

public class OrderNote
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Order Order { get; set; } = null!;
}
