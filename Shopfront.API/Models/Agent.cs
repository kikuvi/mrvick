namespace Shopfront.API.Models;

public class Agent
{
    public Guid Id { get; set; }
    public string Bureau { get; set; } = string.Empty;
    public string PhysicalLocation { get; set; } = string.Empty;
    public string Staff { get; set; } = string.Empty;
    public string Contact { get; set; } = string.Empty;
    public string TeamLeader { get; set; } = string.Empty;
    public string TeamLeaderContact { get; set; } = string.Empty;
    public string Company { get; set; } = "Standard";
    public string Region { get; set; } = string.Empty;
    public bool Confirmed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = NairobiClock.Now;
}
