namespace Shopfront.API.DTOs;

public record VariationDto(Guid Id, string Label);

public record CreateProductDto(
    string Title,
    string Description,
    decimal Price,
    decimal DiscountPrice,
    List<string> ImageUrls,
    List<string>? Variations
);

public record UpdateProductDto(
    string? Title,
    string? Description,
    decimal? Price,
    decimal? DiscountPrice,
    List<string>? ImageUrls,
    List<string>? Variations
);

public record ProductDto(
    Guid Id,
    string Title,
    string Description,
    decimal Price,
    decimal DiscountPrice,
    DateTime CreatedAt,
    List<string> ImageUrls,
    List<VariationDto> Variations
);
