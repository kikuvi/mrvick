using Shopfront.API.Models;

namespace Shopfront.API.DTOs;

public record PlaceOrderDto(
    int ProductId,
    string CustomerName,
    string Phone,
    string? Email,
    string County,
    string DeliveryAddress
);

public record UpdateOrderStatusDto(OrderStatus Status);

public record AssignRiderDto(int RiderId);

public record UpdateExpensesDto(decimal AdvertisingCost, decimal DeliveryFee);

public record OrderDto(
    int Id,
    string TrackingToken,
    string CustomerName,
    string Phone,
    string? Email,
    string County,
    string DeliveryAddress,
    decimal PriceAtOrder,
    decimal AdvertisingCost,
    decimal DeliveryFee,
    decimal Profit,
    string Status,
    int ProductId,
    string ProductTitle,
    int? RiderId,
    string? RiderName,
    DateTime CreatedAt
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
    DateTime CreatedAt
);
