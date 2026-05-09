namespace Shopfront.API.DTOs;

public record UserDto(string Id, string Email, string FullName, string? PhoneNumber, bool EmailConfirmed, bool MustChangePassword);

public record CreateUserDto(string Email, string Password, string FullName, string? PhoneNumber);

public record UpdatePasswordDto(string NewPassword);

public record ChangeOwnPasswordDto(string CurrentPassword, string NewPassword);
