using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Data;
using Shopfront.API.DTOs;

namespace Shopfront.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AgentsController : ControllerBase
{
    private readonly ShopfrontDbContext _db;

    public AgentsController(ShopfrontDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var agents = await _db.Agents
            .OrderBy(a => a.Bureau)
            .Select(a => new AgentDto(
                a.Id,
                a.Bureau,
                a.PhysicalLocation,
                a.Staff,
                a.Contact,
                a.TeamLeader,
                a.TeamLeaderContact,
                a.Company))
            .ToListAsync();

        return Ok(agents);
    }
}
