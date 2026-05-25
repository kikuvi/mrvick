using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Data;
using Shopfront.API.DTOs;
using Shopfront.API.Models;

namespace Shopfront.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly ShopfrontDbContext _db;

    public ExpensesController(ShopfrontDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var expenses = await _db.Expenses
            .OrderByDescending(e => e.Date)
            .Select(e => new ExpenseDto(
                e.Id,
                e.Name,
                e.Amount,
                e.IncurredBy,
                e.Category,
                e.Date,
                e.Notes,
                e.Status.ToString(),
                e.CreatedAt))
            .ToListAsync();

        return Ok(expenses);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateExpenseDto dto)
    {
        var expense = new Expense
        {
            Name = dto.Name.Trim(),
            Amount = dto.Amount,
            IncurredBy = dto.IncurredBy.Trim(),
            Category = dto.Category.Trim(),
            Date = dto.Date.Date,
            Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim()
        };

        _db.Expenses.Add(expense);
        await _db.SaveChangesAsync();

        var result = new ExpenseDto(expense.Id, expense.Name, expense.Amount, expense.IncurredBy,
            expense.Category, expense.Date, expense.Notes, expense.Status.ToString(), expense.CreatedAt);

        return CreatedAtAction(nameof(GetAll), result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateExpenseDto dto)
    {
        var expense = await _db.Expenses.FindAsync(id);
        if (expense is null) return NotFound();

        expense.Name = dto.Name.Trim();
        expense.Amount = dto.Amount;
        expense.IncurredBy = dto.IncurredBy.Trim();
        expense.Category = dto.Category.Trim();
        expense.Date = dto.Date.Date;
        expense.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim();
        expense.Status = dto.Status;

        await _db.SaveChangesAsync();

        var result = new ExpenseDto(expense.Id, expense.Name, expense.Amount, expense.IncurredBy,
            expense.Category, expense.Date, expense.Notes, expense.Status.ToString(), expense.CreatedAt);

        return Ok(result);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateExpenseStatusDto dto)
    {
        var expense = await _db.Expenses.FindAsync(id);
        if (expense is null) return NotFound();

        expense.Status = dto.Status;
        await _db.SaveChangesAsync();

        return Ok(new { expense.Id, Status = expense.Status.ToString() });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var expense = await _db.Expenses.FindAsync(id);
        if (expense is null) return NotFound();

        _db.Expenses.Remove(expense);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}

public record UpdateExpenseStatusDto(ExpenseStatus Status);
