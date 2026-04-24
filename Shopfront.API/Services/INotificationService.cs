namespace Shopfront.API.Services;

public interface INotificationService
{
    Task SendSmsAsync(string phone, string message);
    Task SendEmailAsync(string to, string subject, string htmlBody);
}
