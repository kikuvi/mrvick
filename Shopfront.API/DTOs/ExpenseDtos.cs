using Shopfront.API.Models;

namespace Shopfront.API.DTOs;

public record ExpenseDto(
    Guid Id,
    string Name,
    decimal Amount,
    string IncurredBy,
    string Category,
    DateTime Date,
    string? Notes,
    string Status,
    DateTime CreatedAt
);

public record CreateExpenseDto(
    string Name,
    decimal Amount,
    string IncurredBy,
    string Category,
    DateOnly Date,      // accepts "YYYY-MM-DD" from Angular date inputs
    string? Notes
);

public record UpdateExpenseDto(
    string Name,
    decimal Amount,
    string IncurredBy,
    string Category,
    DateOnly Date,      // accepts "YYYY-MM-DD" from Angular date inputs
    string? Notes,
    ExpenseStatus Status
);
