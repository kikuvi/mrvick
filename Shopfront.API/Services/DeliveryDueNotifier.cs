using Microsoft.EntityFrameworkCore;
using Shopfront.API.Data;
using Shopfront.API.Models;

namespace Shopfront.API.Services;

public class DeliveryDueNotifier : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DeliveryDueNotifier> _logger;

    public DeliveryDueNotifier(IServiceScopeFactory scopeFactory, ILogger<DeliveryDueNotifier> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        // Run once immediately on startup, then every hour
        while (!ct.IsCancellationRequested)
        {
            try { await CheckAsync(ct); }
            catch (Exception ex) { _logger.LogError(ex, "DeliveryDueNotifier error"); }

            await Task.Delay(TimeSpan.FromHours(1), ct);
        }
    }

    private async Task CheckAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ShopfrontDbContext>();

        var today    = NairobiClock.Now.Date;
        var tomorrow = today.AddDays(1);

        // Orders due today or tomorrow that are still DeliverLater
        var due = await db.Orders
            .Where(o => o.Status == OrderStatus.DeliverLater
                     && o.DeliveryDate.HasValue
                     && o.DeliveryDate.Value.Date >= today
                     && o.DeliveryDate.Value.Date <= tomorrow)
            .Select(o => new { o.TrackingToken, o.CustomerName, o.DeliveryDate })
            .ToListAsync(ct);

        if (due.Count == 0) return;

        // Don't duplicate — skip tokens already notified today
        var tokens = due.Select(d => d.TrackingToken).ToList();
        var alreadyNotified = await db.AppNotifications
            .Where(n => n.OrderId != null
                     && tokens.Contains(n.OrderId)
                     && n.CreatedAt >= today
                     && n.Title.StartsWith("Delivery due"))
            .Select(n => n.OrderId)
            .ToListAsync(ct);

        var toNotify = due.Where(d => !alreadyNotified.Contains(d.TrackingToken)).ToList();
        if (toNotify.Count == 0) return;

        foreach (var o in toNotify)
        {
            var when = o.DeliveryDate!.Value.Date == today ? "today" : "tomorrow";
            db.AppNotifications.Add(new AppNotification
            {
                Title   = $"Delivery due {when} — {o.TrackingToken}",
                Message = $"{o.CustomerName} · scheduled for {o.DeliveryDate.Value:dd MMM yyyy}",
                OrderId = o.TrackingToken
            });
        }

        await db.SaveChangesAsync(ct);
        _logger.LogInformation("DeliveryDueNotifier: created {Count} due-delivery notification(s)", toNotify.Count);
    }
}
