namespace Shopfront.API.Models;

public class CourierOffice
{
    public Guid Id { get; set; }
    public Guid CourierId { get; set; }
    public string Office { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Courier Courier { get; set; } = null!;
}
