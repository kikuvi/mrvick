namespace Shopfront.API.DTOs;

public record LoginDto(string Email, string Password);

public record AuthResponseDto(string Token, string Email, string FullName, bool MustChangePassword);

public record ForgotPasswordDto(string Email);

public record ResetPasswordDto(string Email, string Token, string NewPassword);
