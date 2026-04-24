using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

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
        try
        {
            var username = _config["AfricasTalking:Username"];
            var apiKey = _config["AfricasTalking:ApiKey"];

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
        try
        {
            var fromEmail = _config["Gmail:FromEmail"]!;
            var fromName  = _config["Gmail:FromName"] ?? "Shopfront";
            var appPassword = _config["Gmail:AppPassword"]!;

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;
            message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(fromEmail, appPassword);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", to);
        }
    }
}
