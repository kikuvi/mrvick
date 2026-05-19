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
                a.Company,
                a.Region,
                a.Confirmed))
            .ToListAsync();

        return Ok(agents);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAgentDto dto)
    {
        var agent = new Shopfront.API.Models.Agent
        {
            Bureau = dto.Bureau.Trim(),
            PhysicalLocation = dto.PhysicalLocation.Trim(),
            Staff = dto.Staff.Trim(),
            Contact = dto.Contact.Trim(),
            TeamLeader = dto.TeamLeader.Trim(),
            TeamLeaderContact = dto.TeamLeaderContact.Trim(),
            Company = string.IsNullOrWhiteSpace(dto.Company) ? "Standard" : dto.Company.Trim(),
            Region = dto.Region.Trim()
        };

        _db.Agents.Add(agent);
        await _db.SaveChangesAsync();

        var result = new AgentDto(agent.Id, agent.Bureau, agent.PhysicalLocation, agent.Staff,
            agent.Contact, agent.TeamLeader, agent.TeamLeaderContact, agent.Company, agent.Region, agent.Confirmed);

        return CreatedAtAction(nameof(GetAll), result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAgentDto dto)
    {
        var agent = await _db.Agents.FindAsync(id);
        if (agent is null) return NotFound();

        agent.Bureau = dto.Bureau.Trim();
        agent.PhysicalLocation = dto.PhysicalLocation.Trim();
        agent.Staff = dto.Staff.Trim();
        agent.Contact = dto.Contact.Trim();
        agent.TeamLeader = dto.TeamLeader.Trim();
        agent.TeamLeaderContact = dto.TeamLeaderContact.Trim();
        agent.Company = string.IsNullOrWhiteSpace(dto.Company) ? "Standard" : dto.Company.Trim();
        agent.Region = dto.Region.Trim();
        agent.Confirmed = dto.Confirmed;

        await _db.SaveChangesAsync();

        var result = new AgentDto(agent.Id, agent.Bureau, agent.PhysicalLocation, agent.Staff,
            agent.Contact, agent.TeamLeader, agent.TeamLeaderContact, agent.Company, agent.Region, agent.Confirmed);

        return Ok(result);
    }

    [HttpPatch("{id:guid}/confirm")]
    public async Task<IActionResult> ToggleConfirmed(Guid id)
    {
        var agent = await _db.Agents.FindAsync(id);
        if (agent is null) return NotFound();

        agent.Confirmed = !agent.Confirmed;
        await _db.SaveChangesAsync();

        return Ok(new { agent.Id, agent.Confirmed });
    }
}
