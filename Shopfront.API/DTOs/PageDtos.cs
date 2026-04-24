namespace Shopfront.API.DTOs;

public record PageDto(
    int Id,
    string Slug,
    string Title,
    string Content,
    string? MetaDesc,
    DateTime UpdatedAt
);

public record UpdatePageDto(
    string Title,
    string Content,
    string? MetaDesc
);
