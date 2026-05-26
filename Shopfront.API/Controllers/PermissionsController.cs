using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shopfront.API.Authorization;

namespace Shopfront.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PermissionsController : ControllerBase
{
    /// <summary>Returns all permission keys with their labels and groups.</summary>
    [HttpGet("all")]
    public IActionResult GetAll()
    {
        var result = Permissions.All.Select(p => new
        {
            Key = p,
            Label = Permissions.Label(p),
            Group = Permissions.Group(p)
        });

        return Ok(result);
    }
}
