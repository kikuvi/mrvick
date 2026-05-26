namespace Shopfront.API.DTOs;

public record LoginDto(string Email, string Password);

public record AuthResponseDto(string Token, string Email, string FullName, bool MustChangePassword, List<string> Permissions);

public record ForgotPasswordDto(string Email);

public record ResetPasswordDto(string Email, string Token, string NewPassword);
