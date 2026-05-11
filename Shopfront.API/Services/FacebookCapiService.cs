using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Shopfront.API.Data;
using Shopfront.API.Models;

namespace Shopfront.API.Services;

public class FacebookCapiService
{
    private readonly IHttpClientFactory _http;
    private readonly IConfiguration _config;
    private readonly ShopfrontDbContext _db;
    private readonly ILogger<FacebookCapiService> _logger;

    public FacebookCapiService(
        IHttpClientFactory http,
        IConfiguration config,
        ShopfrontDbContext db,
        ILogger<FacebookCapiService> logger)
    {
        _http = http;
        _config = config;
        _db = db;
        _logger = logger;
    }

    public async Task SendPurchaseAsync(Guid orderId, string email, string phone, decimal value, string? eventId = null)
        => await SendAsync("Purchase", eventId ?? $"purchase_{orderId}", email, phone, value, orderId);

    public async Task SendLeadAsync(Guid orderId, string email, string phone, decimal value, string? eventId = null)
        => await SendAsync("Lead", eventId ?? $"lead_{orderId}", email, phone, value, orderId);

    private async Task SendAsync(
        string eventName, string eventId,
        string email, string phone,
        decimal value, Guid? orderId)
    {
        var token   = _config["Facebook:AccessToken"];
        var pixelId = _config["Facebook:PixelId"];

        if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(pixelId))
        {
            _logger.LogWarning("Facebook CAPI not configured — skipping {EventName}", eventName);
            return;
        }

        var payload = new
        {
            data = new[]
            {
                new
                {
                    event_name    = eventName,
                    event_time    = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                    event_id      = eventId,
                    action_source = "website",
                    user_data = new
                    {
                        em = Hash(email.ToLowerInvariant().Trim()),
                        ph = Hash(NormalizePhone(phone))
                    },
                    custom_data = new { value, currency = "KES" }
                }
            }
        };

        try
        {
            var client  = _http.CreateClient("FacebookCapi");
            var url     = $"https://graph.facebook.com/v19.0/{pixelId}/events?access_token={token}";
            var json    = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(url, content);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogError("CAPI {EventName} failed ({Status}): {Body}", eventName, response.StatusCode, body);
                return;
            }

            _db.PixelEvents.Add(new PixelEvent
            {
                EventName = eventName,
                Source    = "CAPI",
                EventId   = eventId,
                OrderId   = orderId,
                Value     = value,
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();

            _logger.LogInformation("CAPI {EventName} sent for order {OrderId}", eventName, orderId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CAPI SendAsync failed for {EventName}", eventName);
        }
    }

    private static string Hash(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static string NormalizePhone(string phone)
    {
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        if (digits.StartsWith("0")) digits = "254" + digits[1..];
        return digits;
    }
}
