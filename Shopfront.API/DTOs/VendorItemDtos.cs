namespace Shopfront.API.DTOs;

public record VendorItemDto(
    Guid Id,
    string ItemName,
    string Vendor,
    string Location,
    decimal Price,
    string Contacts,
    DateTime CreatedAt
);

public record SaveVendorItemDto(
    string ItemName,
    string Vendor,
    string Location,
    decimal Price,
    string Contacts
);
