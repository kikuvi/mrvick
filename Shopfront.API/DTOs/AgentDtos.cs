namespace Shopfront.API.DTOs;

public record AgentDto(
    Guid Id,
    string Bureau,
    string PhysicalLocation,
    string Staff,
    string Contact,
    string TeamLeader,
    string TeamLeaderContact,
    string Company,
    string Region,
    bool Confirmed
);

public record CreateAgentDto(
    string Bureau,
    string PhysicalLocation,
    string Staff,
    string Contact,
    string TeamLeader,
    string TeamLeaderContact,
    string Company,
    string Region
);

public record UpdateAgentDto(
    string Bureau,
    string PhysicalLocation,
    string Staff,
    string Contact,
    string TeamLeader,
    string TeamLeaderContact,
    string Company,
    string Region,
    bool Confirmed
);
