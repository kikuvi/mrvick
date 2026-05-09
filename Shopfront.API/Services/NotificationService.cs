using SendGrid;
using SendGrid.Helpers.Mail;

namespace Shopfront.API.Services;

public class NotificationService : INotificationService
{
    private readonly IConfiguration _config;
    private readonly ILogger<NotificationService> _logger;
    private readonly HttpClient _httpClient;

    public NotificationService(IConfiguration config, ILogger<NotificationService> logger, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient("AfricasTalking");
    }

    public async Task SendSmsAsync(string phone, string message)
    {
        var apiKey = _config["AfricasTalking:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey) || apiKey.StartsWith("REPLACE"))
        {
            _logger.LogInformation("SMS skipped (Africa's Talking not configured). To: {Phone} | {Message}", phone, message);
            return;
        }

        try
        {
            var username = _config["AfricasTalking:Username"];

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.africastalking.com/version1/messaging");
            request.Headers.Add("apiKey", apiKey);
            request.Headers.Add("Accept", "application/json");

            request.Content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("username", username!),
                new KeyValuePair<string, string>("to", phone),
                new KeyValuePair<string, string>("message", message)
            });

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                _logger.LogWarning("SMS to {Phone} returned {Status}", phone, response.StatusCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SMS to {Phone}", phone);
        }
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        var apiKey = _config["SendGrid:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogInformation("Email skipped (SendGrid not configured). To: {To} | {Subject}", to, subject);
            return;
        }

        try
        {
            var fromEmail = _config["SendGrid:FromEmail"]!;
            var fromName  = _config["SendGrid:FromName"] ?? "Shopfront";

            var client = new SendGridClient(apiKey);
            var msg = MailHelper.CreateSingleEmail(
                new EmailAddress(fromEmail, fromName),
                new EmailAddress(to),
                subject,
                plainTextContent: null,
                htmlContent: htmlBody
            );
            msg.SetReplyTo(new EmailAddress(fromEmail, fromName));

            var response = await client.SendEmailAsync(msg);
            if (!response.IsSuccessStatusCode)
                _logger.LogWarning("SendGrid returned {Status} for email to {To}", response.StatusCode, to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", to);
        }
    }
}
