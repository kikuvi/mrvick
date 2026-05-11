namespace Shopfront.API.DTOs;

public record LogPixelEventDto(
    string EventName,
    string? EventId,
    string? ProductId,
    decimal? Value
);

public record PixelCoverageRow(
    string EventName,
    int PixelCount,
    int CapiCount
);
