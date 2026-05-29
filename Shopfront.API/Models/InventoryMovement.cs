namespace Shopfront.API.Models;

public class InventoryMovement
{
    public Guid Id { get; set; }
    public Guid InventoryItemId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? FulfillmentNote { get; set; }
    public string MovedByEmail { get; set; } = string.Empty;
    public string ApprovedByEmail { get; set; } = string.Empty;
    public DateTime MovedAt { get; set; } = NairobiClock.Now;

    public InventoryItem Item { get; set; } = null!;
}
