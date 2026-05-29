namespace Shopfront.API.Models;

public class Courier
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = NairobiClock.Now;

    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<CourierOffice> Offices { get; set; } = new List<CourierOffice>();
}
