using Shopfront.API.Models;

namespace Shopfront.API.DTOs;

public record PlaceOrderDto(
    Guid ProductId,
    string CustomerName,
    string Phone,
    string? Email,
    string County,
    string DeliveryAddress,
    string? Variation,
    string? LeadEventId,
    string? PurchaseEventId,
    string? EventSourceUrl,
    string? Fbp,
    string? Fbc
);

public record UpdateOrderStatusDto(OrderStatus Status);

public record AssignRiderDto(Guid RiderId);

public record AssignCourierDto(Guid CourierId);

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
    Guid? CourierId,
    string? CourierName,
    DateTime CreatedAt,
    string? Variation,
    bool IsArchived
);

public record AddNoteDto(string Content);

public record OrderNoteDto(Guid Id, string Content, string? CreatedBy, DateTime CreatedAt);

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
