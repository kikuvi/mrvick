using Microsoft.AspNetCore.Identity;

namespace Shopfront.API.Models;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public bool MustChangePassword { get; set; } = false;
}
