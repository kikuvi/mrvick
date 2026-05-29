namespace Shopfront.API.Models;

public class PixelEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string EventName { get; set; } = "";   // Purchase, Lead, ViewContent, etc.
    public string Source { get; set; } = "";       // "Pixel" | "CAPI"
    public string? EventId { get; set; }           // Shared ID for deduplication
    public Guid? OrderId { get; set; }
    public string? ProductId { get; set; }
    public decimal? Value { get; set; }
    public DateTime CreatedAt { get; set; } = NairobiClock.Now;
}
