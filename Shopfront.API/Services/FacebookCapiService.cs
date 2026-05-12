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

    public async Task SendPurchaseAsync(Guid orderId, string email, string phone, string name, decimal value,
        string? eventId = null, string? sourceUrl = null, string? fbp = null, string? fbc = null)
        => await SendAsync("Purchase", eventId ?? $"purchase_{orderId}", email, phone, name, value, orderId, sourceUrl, fbp, fbc);

    public async Task SendLeadAsync(Guid orderId, string email, string phone, string name, decimal value,
        string? eventId = null, string? sourceUrl = null, string? fbp = null, string? fbc = null)
        => await SendAsync("Lead", eventId ?? $"lead_{orderId}", email, phone, name, value, orderId, sourceUrl, fbp, fbc);

    private async Task SendAsync(
        string eventName, string eventId,
        string email, string phone, string name,
        decimal value, Guid? orderId, string? sourceUrl = null,
        string? fbp = null, string? fbc = null)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        if (normalizedEmail is "joneskikuvi2@gmail.com" or "alexanwambua@gmail.com")
        {
            _logger.LogInformation("CAPI {EventName} skipped — test account {Email}", eventName, email);
            return;
        }

        var token   = _config["Facebook:AccessToken"];
        var pixelId = _config["Facebook:PixelId"];

        if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(pixelId))
        {
            _logger.LogWarning("Facebook CAPI not configured — skipping {EventName}", eventName);
            return;
        }

        // Build user_data — only include fields that have real values
        var userData = new Dictionary<string, string>();

        if (!string.IsNullOrWhiteSpace(email))
            userData["em"] = Hash(email.ToLowerInvariant().Trim());

        if (!string.IsNullOrWhiteSpace(phone))
            userData["ph"] = Hash(NormalizePhone(phone));

        var (fn, ln) = ParseName(name);
        if (fn is not null) userData["fn"] = Hash(fn.ToLowerInvariant());
        if (ln is not null) userData["ln"] = Hash(ln.ToLowerInvariant());

        // fbp / fbc are not hashed — passed through as-is
        if (!string.IsNullOrWhiteSpace(fbp)) userData["fbp"] = fbp;
        if (!string.IsNullOrWhiteSpace(fbc)) userData["fbc"] = fbc;

        var payload = new
        {
            data = new[]
            {
                new
                {
                    event_name       = eventName,
                    event_time       = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                    event_id         = eventId,
                    action_source    = "website",
                    event_source_url = sourceUrl,
                    user_data        = userData,
                    custom_data      = new { value, currency = "KES" }
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

    private static (string? firstName, string? lastName) ParseName(string name)
    {
        var parts = name.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length switch
        {
            0 => (null, null),
            1 => (parts[0], null),
            _ => (parts[0], parts[^1])
        };
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
