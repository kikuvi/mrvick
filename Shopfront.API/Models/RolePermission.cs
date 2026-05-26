namespace Shopfront.API.Models;

public class RolePermission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RoleId { get; set; }
    public string Permission { get; set; } = string.Empty;

    public AppRole Role { get; set; } = default!;
}
