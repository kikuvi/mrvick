namespace Shopfront.API.DTOs;

public record CreateProductDto(
    string Title,
    string Description,
    decimal Price,
    decimal DiscountPrice,
    List<string> ImageUrls
);

public record UpdateProductDto(
    string? Title,
    string? Description,
    decimal? Price,
    decimal? DiscountPrice,
    List<string>? ImageUrls
);

public record ProductDto(
    int Id,
    string Title,
    string Description,
    decimal Price,
    decimal DiscountPrice,
    DateTime CreatedAt,
    List<string> ImageUrls
);
