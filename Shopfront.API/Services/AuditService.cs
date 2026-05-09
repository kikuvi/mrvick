using Shopfront.API.Data;
using Shopfront.API.Models;

namespace Shopfront.API.Services;

public class AuditService
{
    private readonly ShopfrontDbContext _db;

    public AuditService(ShopfrontDbContext db) => _db = db;

    public async Task LogAsync(string action, string? userEmail = null, string? entityType = null, string? entityId = null, string? details = null)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            Action = action,
            UserEmail = userEmail,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }
}
