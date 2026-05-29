namespace Shopfront.API.Models;

public class Rider
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string County { get; set; } = string.Empty;
    public string LocalTown { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = NairobiClock.Now;

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
