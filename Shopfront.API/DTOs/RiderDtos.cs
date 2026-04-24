namespace Shopfront.API.DTOs;

public record CreateRiderDto(
    string Name,
    string Phone,
    string County,
    string LocalTown
);

public record RiderDto(
    Guid Id,
    string Name,
    string Phone,
    string County,
    string LocalTown,
    DateTime CreatedAt
);
