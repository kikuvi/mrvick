namespace Shopfront.API.DTOs;

public record CreateRiderDto(
    string Name,
    string Phone,
    string County,
    string LocalTown
);

public record RiderDto(
    int Id,
    string Name,
    string Phone,
    string County,
    string LocalTown,
    DateTime CreatedAt
);
