namespace Shopfront.API.Models;

public class Page
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? MetaDesc { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
