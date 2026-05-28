namespace Shopfront.API.DTOs;

public record InventoryMovementDto(
    Guid Id,
    string Reason,
    string? FulfillmentNote,
    string MovedBy,
    string ApprovedBy,
    DateTime MovedAt
);

public record InventoryItemDto(
    Guid Id,
    Guid OrderId,
    string TrackingToken,
    string ProductTitle,
    string? Variation,
    decimal BuyingPrice,
    string? Notes,
    DateTime CreatedAt,
    bool IsMoved,
    DateTime? MovedAt,
    InventoryMovementDto? Movement
);

public record MoveFromInventoryDto(
    string Reason,
    string? FulfillmentNote
);
