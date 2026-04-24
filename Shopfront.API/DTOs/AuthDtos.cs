namespace Shopfront.API.DTOs;

public record LoginDto(string Email, string Password);

public record AuthResponseDto(string Token, string Email);

public record ForgotPasswordDto(string Email);

public record ResetPasswordDto(string Email, string Token, string NewPassword);
