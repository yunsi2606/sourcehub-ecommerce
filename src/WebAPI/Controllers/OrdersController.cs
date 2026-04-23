using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SourceEcommerce.Application.DTOs.Order;
using SourceEcommerce.Application.Services;

namespace SourceEcommerce.API.Controllers;

/// <summary>
/// Order management: checkout, history, and admin overview.
/// </summary>
[Authorize]
public class OrdersController(OrderService orderService) : BaseApiController
{
    /// <summary>Place a new order (checkout).</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest req, CancellationToken ct)
    {
        var order = await orderService.CreateOrderAsync(CurrentUserId, req, ct);
        return CreatedAtAction(nameof(GetDetail), new { id = order.Id }, order);
    }

    /// <summary>Get current user's order history.</summary>
    [HttpGet("my")]
    public async Task<IActionResult> GetMyOrders([FromQuery] OrderQueryParams q, CancellationToken ct)
        => Ok(await orderService.GetUserOrdersAsync(CurrentUserId, q, ct));

    /// <summary>Get full order detail (user's own order).</summary>
    [HttpGet("{id:guid}", Name = "GetOrderDetail")]
    public async Task<IActionResult> GetDetail(Guid id, CancellationToken ct)
        => OkOrNotFound(await orderService.GetOrderDetailAsync(CurrentUserId, id, ct));

    // Admin

    /// <summary>Admin: get all orders with optional status filter.</summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] OrderQueryParams q, CancellationToken ct)
        => Ok(await orderService.GetAllOrdersAsync(q, ct));

    /// <summary>Admin: get any order by ID.</summary>
    [HttpGet("admin/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetDetailAdmin(Guid id, CancellationToken ct)
        => OkOrNotFound(await orderService.GetOrderDetailAdminAsync(id, ct));

    /// <summary>
    /// Webhook callback — triggers order fulfillment after payment is confirmed.
    /// In production, verify the webhook signature from your payment provider first.
    /// </summary>
    [HttpPost("{id:guid}/fulfill")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Fulfill(Guid id, CancellationToken ct)
    {
        await orderService.FulfillOrderAsync(id, ct);
        return NoContent();
    }
}
