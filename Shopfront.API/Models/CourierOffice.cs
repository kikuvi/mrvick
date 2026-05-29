namespace Shopfront.API.Models;

public class CourierOffice
{
    public Guid Id { get; set; }
    public Guid CourierId { get; set; }
    public string Office { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = NairobiClock.Now;

    public Courier Courier { get; set; } = null!;
}
