using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Data;
using Shopfront.API.DTOs;
using Shopfront.API.Models;
using Shopfront.API.Services;

namespace Shopfront.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly ShopfrontDbContext _db;
    private readonly INotificationService _notifications;
    private readonly IConfiguration _config;

    public OrdersController(ShopfrontDbContext db, INotificationService notifications, IConfiguration config)
    {
        _db = db;
        _notifications = notifications;
        _config = config;
    }

    [HttpPost]
    public async Task<IActionResult> PlaceOrder(PlaceOrderDto dto)
    {
        var product = await _db.Products.FindAsync(dto.ProductId);
        if (product is null) return BadRequest("Product not found.");

        var order = new Order
        {
            TrackingToken = Guid.NewGuid().ToString("N")[..12].ToUpper(),
            ProductId = dto.ProductId,
            CustomerName = dto.CustomerName,
            Phone = dto.Phone,
            Email = dto.Email,
            County = dto.County,
            DeliveryAddress = dto.DeliveryAddress,
            PriceAtOrder = product.DiscountPrice > 0 ? product.DiscountPrice : product.Price
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        var baseUrl = _config["App:BaseUrl"] ?? "https://shopfront.co.ke";
        var trackingUrl = $"{baseUrl}/track/{order.TrackingToken}";

        await _notifications.SendSmsAsync(order.Phone,
            $"Hi {order.CustomerName}, your Shopfront order has been placed! Track it here: {trackingUrl}");

        if (!string.IsNullOrEmpty(order.Email))
        {
            var emailBody = $@"
<!DOCTYPE html>
<html lang='en'>
<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'></head>
<body style='margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='background:#f4f6fb;padding:32px 0;'>
    <tr><td align='center'>
      <table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%;'>

        <!-- Header -->
        <tr>
          <td style='background:#1d3557;border-radius:10px 10px 0 0;padding:28px 32px;text-align:center;'>
            <h1 style='margin:0;color:#ffffff;font-size:24px;letter-spacing:1px;'>Shopfront</h1>
            <p style='margin:6px 0 0;color:rgba(255,255,255,.7);font-size:13px;'>Quality products, delivered to your door</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style='background:#ffffff;padding:32px;'>

            <p style='margin:0 0 8px;font-size:20px;font-weight:700;color:#1d3557;'>
              Thank you, {order.CustomerName}! &#127881;
            </p>
            <p style='margin:0 0 24px;font-size:15px;color:#555;'>
              Your order has been received and is being processed. Here's a summary:
            </p>

            <!-- Order details box -->
            <table width='100%' cellpadding='0' cellspacing='0'
              style='background:#f8f9fb;border-radius:8px;border:1px solid #e8eaf0;margin-bottom:24px;'>
              <tr>
                <td style='padding:20px 24px;'>
                  <table width='100%' cellpadding='0' cellspacing='0'>
                    <tr>
                      <td style='font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#999;padding-bottom:12px;' colspan='2'>
                        Order Details
                      </td>
                    </tr>
                    <tr>
                      <td style='font-size:14px;color:#666;padding:5px 0;'>Product</td>
                      <td style='font-size:14px;color:#1a1a1a;font-weight:600;padding:5px 0;text-align:right;'>{product.Title}</td>
                    </tr>
                    <tr>
                      <td style='font-size:14px;color:#666;padding:5px 0;'>Amount</td>
                      <td style='font-size:14px;color:#e63946;font-weight:700;padding:5px 0;text-align:right;'>KES {order.PriceAtOrder:N0}</td>
                    </tr>
                    <tr>
                      <td style='font-size:14px;color:#666;padding:5px 0;'>Delivery to</td>
                      <td style='font-size:14px;color:#1a1a1a;padding:5px 0;text-align:right;'>{order.County}</td>
                    </tr>
                    <tr>
                      <td style='font-size:14px;color:#666;padding:5px 0;'>Address</td>
                      <td style='font-size:14px;color:#1a1a1a;padding:5px 0;text-align:right;'>{order.DeliveryAddress}</td>
                    </tr>
                    <tr>
                      <td colspan='2' style='border-top:1px solid #e8eaf0;padding-top:12px;margin-top:8px;'>
                        <table width='100%'><tr>
                          <td style='font-size:13px;color:#666;'>Tracking Code</td>
                          <td style='text-align:right;'>
                            <span style='font-family:monospace;font-size:16px;font-weight:700;letter-spacing:3px;color:#1d3557;'>
                              {order.TrackingToken}
                            </span>
                          </td>
                        </tr></table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA button -->
            <table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom:24px;'>
              <tr>
                <td align='center'>
                  <a href='{trackingUrl}'
                    style='display:inline-block;background:#e63946;color:#ffffff;text-decoration:none;
                           padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:.3px;'>
                    Track My Order
                  </a>
                </td>
              </tr>
            </table>

            <p style='margin:0;font-size:13px;color:#888;text-align:center;line-height:1.6;'>
              You can also copy your tracking code and paste it at<br>
              <a href='{_config["App:BaseUrl"]}/track' style='color:#1d3557;'>{_config["App:BaseUrl"]}/track</a>
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style='background:#f0f2f7;border-radius:0 0 10px 10px;padding:20px 32px;text-align:center;border-top:1px solid #e4e6ef;'>
            <p style='margin:0 0 4px;font-size:13px;color:#888;'>
              Need help? Reply to this email or contact us anytime.
            </p>
            <p style='margin:0;font-size:12px;color:#bbb;'>
              &copy; {DateTime.UtcNow.Year} Shopfront. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>";

            await _notifications.SendEmailAsync(order.Email, "Order Confirmed — Shopfront", emailBody);
        }

        var adminPhone = _config["App:AdminPhone"];
        if (!string.IsNullOrEmpty(adminPhone))
        {
            await _notifications.SendSmsAsync(adminPhone,
                $"New order #{order.TrackingToken} from {order.CustomerName} ({order.County}) for {product.Title}.");
        }

        return CreatedAtAction(nameof(Track), new { token = order.TrackingToken }, new { order.TrackingToken });
    }

    [HttpGet("track/{token}")]
    public async Task<IActionResult> Track(string token)
    {
        var order = await _db.Orders
            .Include(o => o.Product)
            .Include(o => o.Rider)
            .FirstOrDefaultAsync(o => o.TrackingToken == token);

        if (order is null) return NotFound();

        return Ok(new TrackOrderDto(
            order.TrackingToken,
            order.CustomerName,
            order.County,
            order.DeliveryAddress,
            order.PriceAtOrder,
            order.Status.ToString(),
            order.Product.Title,
            order.Rider?.Name,
            order.CreatedAt
        ));
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var orders = await _db.Orders
            .Include(o => o.Product)
            .Include(o => o.Rider)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderDto(
                o.Id, o.TrackingToken, o.CustomerName, o.Phone, o.Email,
                o.County, o.DeliveryAddress, o.PriceAtOrder,
                o.AdvertisingCost, o.DeliveryFee,
                o.PriceAtOrder - (o.AdvertisingCost + o.DeliveryFee),
                o.Status.ToString(), o.ProductId, o.Product.Title,
                o.RiderId, o.Rider != null ? o.Rider.Name : null,
                o.CreatedAt
            ))
            .ToListAsync();

        return Ok(orders);
    }

    [Authorize]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusDto dto)
    {
        var order = await _db.Orders.Include(o => o.Product).FirstOrDefaultAsync(o => o.Id == id);
        if (order is null) return NotFound();

        order.Status = dto.Status;
        await _db.SaveChangesAsync();

        var message = dto.Status switch
        {
            OrderStatus.Assigned => $"Hi {order.CustomerName}, your Shopfront order has been assigned to a rider and will be delivered soon.",
            OrderStatus.InTransit => $"Hi {order.CustomerName}, your Shopfront order is on the way!",
            OrderStatus.Delivered => $"Hi {order.CustomerName}, your Shopfront order has been delivered. Thank you!",
            OrderStatus.Rejected => $"Hi {order.CustomerName}, unfortunately your Shopfront order could not be fulfilled. Please contact us for assistance.",
            _ => null
        };

        if (message is not null)
            await _notifications.SendSmsAsync(order.Phone, message);

        return NoContent();
    }

    [Authorize]
    [HttpPatch("{id}/assign")]
    public async Task<IActionResult> AssignRider(int id, AssignRiderDto dto)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order is null) return NotFound();

        var rider = await _db.Riders.FindAsync(dto.RiderId);
        if (rider is null) return BadRequest("Rider not found.");

        order.RiderId = dto.RiderId;
        order.Status = OrderStatus.Assigned;
        await _db.SaveChangesAsync();

        await _notifications.SendSmsAsync(order.Phone,
            $"Hi {order.CustomerName}, your Shopfront order has been assigned to rider {rider.Name}.");

        return NoContent();
    }

    [Authorize]
    [HttpPatch("{id}/expenses")]
    public async Task<IActionResult> UpdateExpenses(int id, UpdateExpensesDto dto)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order is null) return NotFound();

        order.AdvertisingCost = dto.AdvertisingCost;
        order.DeliveryFee = dto.DeliveryFee;
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
