namespace Shopfront.API.Models;

public class UserRole
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    public Guid RoleId { get; set; }

    public AppUser User { get; set; } = default!;
    public AppRole Role { get; set; } = default!;
}
