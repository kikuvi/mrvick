namespace Shopfront.API.Models;

public class VendorItem
{
    public Guid Id { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Vendor { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Contacts { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
