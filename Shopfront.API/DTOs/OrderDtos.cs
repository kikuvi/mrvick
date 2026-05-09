using Shopfront.API.Models;

namespace Shopfront.API.DTOs;

public record PlaceOrderDto(
    Guid ProductId,
    string CustomerName,
    string Phone,
    string? Email,
    string County,
    string DeliveryAddress,
    string? Variation
);

public record UpdateOrderStatusDto(OrderStatus Status);

public record AssignRiderDto(Guid RiderId);

public record UpdateExpensesDto(decimal BuyingPrice, decimal AdvertisingCost, decimal DeliveryFee);

public record OrderDto(
    Guid Id,
    string TrackingToken,
    string CustomerName,
    string Phone,
    string? Email,
    string County,
    string DeliveryAddress,
    decimal PriceAtOrder,
    decimal BuyingPrice,
    decimal AdvertisingCost,
    decimal DeliveryFee,
    decimal Profit,
    string Status,
    Guid ProductId,
    string ProductTitle,
    Guid? RiderId,
    string? RiderName,
    DateTime CreatedAt,
    string? Variation,
    bool IsArchived
);

public record TrackOrderDto(
    string TrackingToken,
    string CustomerName,
    string County,
    string DeliveryAddress,
    decimal PriceAtOrder,
    string Status,
    string ProductTitle,
    string? RiderName,
    DateTime CreatedAt,
    string? Variation
);
