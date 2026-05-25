namespace Shopfront.API.Models;

public enum ExpenseStatus
{
    Pending,
    Settled
}

public class Expense
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string IncurredBy { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string? Notes { get; set; }
    public ExpenseStatus Status { get; set; } = ExpenseStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
