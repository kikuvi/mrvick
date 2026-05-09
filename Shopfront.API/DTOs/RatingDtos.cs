namespace Shopfront.API.DTOs;

public record SubmitRatingDto(
    string CustomerName,
    int Rating,
    string Comment
);

public record RatingDto(
    Guid Id,
    string CustomerName,
    int Rating,
    string Comment,
    bool IsApproved,
    DateTime CreatedAt,
    Guid ProductId,
    string ProductTitle
);
