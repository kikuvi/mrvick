namespace Shopfront.API.Models;

public class PageView
{
    public int Id { get; set; }
    public string Path { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public int Count { get; set; }
}
