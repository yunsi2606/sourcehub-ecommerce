using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.DTOs.Order;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Entities;
using SourceEcommerce.Domain.Enums;
using SourceEcommerce.Domain.Interfaces;

namespace SourceEcommerce.Application.Services;

public class OrderService(IApplicationDbContext db)
{
    /// <summary>Create an order from checkout items. Returns the new Order or throws on invalid input.</summary>
    public async Task<OrderDetailDto> CreateOrderAsync(Guid userId, CreateOrderRequest req, CancellationToken ct = default)
    {
        // Load all requested products + addons in one query
        var productIds = req.Items.Select(i => i.ProductId).ToList();
        var products = await db.Products
            .Include(p => p.Addons)
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToListAsync(ct);

        if (products.Count != req.Items.Count)
            throw new InvalidOperationException("One or more products not found or inactive.");

        var order = new Order { UserId = userId, Notes = req.Notes };

        decimal subTotal = 0;

        foreach (var item in req.Items)
        {
            var product = products.First(p => p.Id == item.ProductId);
            var effectivePrice = product.SalePrice ?? product.Price;
            var lineTotal = effectivePrice * item.Quantity;
            subTotal += lineTotal;

            var orderItem = new OrderItem
            {
                OrderId = order.Id,
                ProductId = product.Id,
                PriceAtPurchase = effectivePrice,
                Quantity = item.Quantity
            };

            // Add selected add-ons
            if (item.SelectedAddonIds is { Count: > 0 })
            {
                var validAddons = product.Addons
                    .Where(a => a.IsActive && item.SelectedAddonIds.Contains(a.Id))
                    .ToList();

                orderItem.Addons = validAddons.Select(a =>
                {
                    subTotal += a.Price;
                    return new OrderItemAddon
                    {
                        OrderItemId = orderItem.Id,
                        ProductAddonId = a.Id,
                        PriceAtPurchase = a.Price
                    };
                }).ToList();
            }

            order.Items.Add(orderItem);
        }

        order.SubTotal = subTotal;
        order.TotalAmount = subTotal - order.DiscountAmount;
        order.Status = OrderStatus.Pending;

        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);

        return await GetOrderDetailAsync(userId, order.Id, ct)
               ?? throw new InvalidOperationException("Failed to retrieve created order.");
    }

    public async Task<List<OrderSummaryDto>> GetUserOrdersAsync(Guid userId, OrderQueryParams q, CancellationToken ct = default)
    {
        var query = db.Orders
            .Where(o => o.UserId == userId)
            .AsNoTracking();

        if (q.Status.HasValue) query = query.Where(o => o.Status == q.Status);

        return await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((q.Page - 1) * q.PageSize).Take(q.PageSize)
            .Select(o => new OrderSummaryDto(
                o.Id, o.Status, o.SubTotal, o.DiscountAmount, o.TotalAmount,
                o.Items.Count, o.CreatedAt, q.Currency))
            .ToListAsync(ct);
    }

    /// <summary>Admin: get all orders across all users.</summary>
    public async Task<List<OrderSummaryDto>> GetAllOrdersAsync(OrderQueryParams q, CancellationToken ct = default)
    {
        var query = db.Orders.AsNoTracking();

        if (q.Status.HasValue) query = query.Where(o => o.Status == q.Status);

        return await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((q.Page - 1) * q.PageSize).Take(q.PageSize)
            .Select(o => new OrderSummaryDto(
                o.Id, o.Status, o.SubTotal, o.DiscountAmount, o.TotalAmount,
                o.Items.Count, o.CreatedAt, q.Currency))
            .ToListAsync(ct);
    }

    public async Task<OrderDetailDto?> GetOrderDetailAsync(Guid userId, Guid orderId, CancellationToken ct = default)
    {
        var order = await db.Orders
            .Include(o => o.Items)
                .ThenInclude(oi => oi.Product).ThenInclude(p => p.Files)
            .Include(o => o.Items)
                .ThenInclude(oi => oi.Addons).ThenInclude(a => a.ProductAddon)
            .Include(o => o.Payments)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId, ct);

        if (order == null) return null;
        return MapToDetail(order);
    }

    /// <summary>Admin: get any order by ID regardless of user.</summary>
    public async Task<OrderDetailDto?> GetOrderDetailAdminAsync(Guid orderId, CancellationToken ct = default)
    {
        var order = await db.Orders
            .Include(o => o.Items).ThenInclude(oi => oi.Product).ThenInclude(p => p.Files)
            .Include(o => o.Items).ThenInclude(oi => oi.Addons).ThenInclude(a => a.ProductAddon)
            .Include(o => o.Payments)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);

        return order == null ? null : MapToDetail(order);
    }

    /// <summary>Called by payment webhook handler after successful payment confirmation.</summary>
    public async Task FulfillOrderAsync(Guid orderId, CancellationToken ct = default)
    {
        var order = await db.Orders
            .Include(o => o.Items).ThenInclude(oi => oi.Product)
            .Include(o => o.Items).ThenInclude(oi => oi.Addons).ThenInclude(a => a.ProductAddon)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct)
            ?? throw new InvalidOperationException($"Order {orderId} not found.");

        if (order.Status == OrderStatus.Paid) return; // Idempotent

        order.Status = OrderStatus.Paid;

        foreach (var item in order.Items)
        {
            // Auto-generate LicenseKey for products that require it
            if (item.Product.RequiresLicense)
            {
                db.LicenseKeys.Add(new LicenseKey
                {
                    OrderItemId = item.Id,
                    KeyString = GenerateLicenseKey(),
                    MaxActivations = 1
                });
            }

            // Auto-create ServiceProject for StandaloneService products
            if (item.Product.ProductType == ProductType.StandaloneService)
            {
                db.ServiceProjects.Add(new ServiceProject
                {
                    OrderItemId = item.Id,
                    Status = ServiceProjectStatus.Pending
                });

                // If billing cycle is recurring, create Subscription
                if (item.Product.BillingCycle is Domain.Enums.BillingCycle.Monthly or Domain.Enums.BillingCycle.Yearly)
                {
                    var periodEnd = item.Product.BillingCycle == Domain.Enums.BillingCycle.Monthly
                        ? DateTime.UtcNow.AddMonths(1)
                        : DateTime.UtcNow.AddYears(1);

                    db.Subscriptions.Add(new Subscription
                    {
                        OrderItemId = item.Id,
                        UserId = order.UserId,
                        BillingCycle = item.Product.BillingCycle.Value,
                        Status = SubscriptionStatus.Active,
                        CurrentPeriodStart = DateTime.UtcNow,
                        CurrentPeriodEnd = periodEnd,
                        AutoRenew = true
                    });
                }
            }

            // Auto-create ServiceProject for Add-on services
            foreach (var addon in item.Addons)
            {
                db.ServiceProjects.Add(new ServiceProject
                {
                    OrderItemAddonId = addon.Id,
                    Status = ServiceProjectStatus.Pending
                });
            }

            // Update sales counter
            await db.Products.Where(p => p.Id == item.ProductId)
                .ExecuteUpdateAsync(s => s.SetProperty(p => p.TotalSales, p => p.TotalSales + item.Quantity), ct);
        }

        // Send notification (placeholder — real impl would publish an event)
        db.Notifications.Add(new Notification
        {
            UserId = order.UserId,
            Title = "Thanh toán thành công!",
            Message = $"Đơn hàng #{order.Id.ToString()[..8].ToUpper()} đã được xác nhận.",
            Type = NotificationType.OrderConfirmed,
            RedirectUrl = $"/orders/{order.Id}"
        });

        await db.SaveChangesAsync(ct);
    }

    // Mappers

    private static OrderDetailDto MapToDetail(Order o) => new(
        o.Id, o.UserId, o.Status, o.SubTotal, o.DiscountAmount, o.TotalAmount, o.Notes,
        o.Items.Select(oi => new OrderItemDto(
                oi.Id,
                oi.ProductId,
                oi.Product.Title,
                oi.Product.Slug,
                oi.Product.Files.FirstOrDefault(f => f.FileType == FileType.Image) != null
                    ? oi.Product.Files.FirstOrDefault(f => f.FileType == FileType.Image)!.FileUrl
                    : null,
                oi.PriceAtPurchase,
                oi.Quantity,
                oi.Addons.Select(a => new OrderItemAddonDto(
                    a.ProductAddonId, a.ProductAddon.Name, a.PriceAtPurchase)).ToList())).ToList(),
        o.Payments.Select(p => new PaymentDto(
            p.Id, p.PaymentGateway, p.TransactionId, p.Amount, p.Status, p.PaidAt)).ToList(),
        o.CreatedAt
    );

    private static string GenerateLicenseKey()
    {
        var parts = Enumerable.Range(0, 4)
            .Select(_ => Guid.NewGuid().ToString("N")[..8].ToUpper());
        return string.Join("-", parts); // e.g. ABCD1234-EF567890-12345678-ABCDEF12
    }
}
