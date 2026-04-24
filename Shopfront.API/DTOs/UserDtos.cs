namespace Shopfront.API.DTOs;

public record UserDto(string Id, string Email, bool EmailConfirmed);

public record CreateUserDto(string Email, string Password);

public record UpdatePasswordDto(string NewPassword);
