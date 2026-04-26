using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.DTOs.Order;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Entities;
using SourceEcommerce.Domain.Enums;
using SourceEcommerce.Domain.Interfaces;

namespace SourceEcommerce.Application.Services;

/// <summary>
/// Handles payment initiation and webhook fulfillment for product orders.
/// Separate from PlanService which handles plan/subscription payments.
/// </summary>
public class PaymentService(
    IApplicationDbContext db,
    IStripeService stripeService)
{
    /// <summary>
    /// Initiate a Stripe Checkout Session for an existing pending Order.
    /// Creates a Payment record and returns the Stripe redirect URL.
    /// </summary>
    public async Task<string> InitiateStripeCheckoutAsync(Guid userId, Guid orderId, CancellationToken ct = default)
    {
        var order = await db.Orders
            .Include(o => o.Items).ThenInclude(oi => oi.Product)
            .Include(o => o.Items).ThenInclude(oi => oi.Addons).ThenInclude(a => a.ProductAddon)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId, ct)
            ?? throw new InvalidOperationException("Order not found or access denied.");

        if (order.Status != OrderStatus.Pending)
            throw new InvalidOperationException($"Order is already {order.Status} and cannot be paid again.");

        var user = await db.Users.FindAsync([userId], ct)
            ?? throw new InvalidOperationException("User not found.");

        // Ensure Stripe customer
        var customerId = await stripeService.EnsureCustomerAsync(user.Email, user.Id.ToString(), user.FullName, ct);

        // Build line items: one per OrderItem + its addons merged
        var lineItems = new List<(string name, long amountVnd, long quantity)>();
        foreach (var item in order.Items)
        {
            var basePrice = (long)item.PriceAtPurchase;
            var addonTotal = item.Addons.Sum(a => (long)a.PriceAtPurchase);
            lineItems.Add((item.Product.Title, basePrice + addonTotal, item.Quantity));
        }

        // Create a Payment record (Pending)
        var payment = new Payment
        {
            OrderId = order.Id,
            PaymentGateway = PaymentGateway.Stripe,
            Amount = order.TotalAmount,
            Status = PaymentStatus.Pending
        };
        db.Payments.Add(payment);
        await db.SaveChangesAsync(ct);

        // Create Stripe session and return URL
        var checkoutUrl = await stripeService.CreateOrderCheckoutSessionAsync(
            customerId,
            order.Id.ToString(),
            payment.Id.ToString(),
            lineItems,
            ct);

        return checkoutUrl;
    }

    /// <summary>
    /// Handle Stripe webhook: mark payment as Paid and fulfill the order.
    /// </summary>
    public async Task HandleStripeWebhookAsync(string payload, string signature, CancellationToken ct = default)
    {
        await stripeService.ProcessWebhookAsync(
            payload, signature,
            onCheckoutCompleted: (_, _, _) => Task.CompletedTask,
            onInvoicePaid: (_, _, _) => Task.CompletedTask,
            onSubscriptionDeleted: (_) => Task.CompletedTask,
            onOrderPaymentCompleted: async (orderIdStr, paymentIdStr) =>
            {
                if (!Guid.TryParse(orderIdStr, out var orderId) ||
                    !Guid.TryParse(paymentIdStr, out var paymentId))
                    return;

                var payment = await db.Payments.FindAsync([paymentId], ct);
                if (payment == null || payment.Status == PaymentStatus.Success) return;

                payment.Status = PaymentStatus.Success;
                payment.PaidAt = DateTime.UtcNow;
                payment.TransactionId = orderIdStr; // store for auditing
                await db.SaveChangesAsync(ct);

                // Fulfill the order (issue license keys, create service projects, etc.)
                var order = await db.Orders
                    .Include(o => o.Items).ThenInclude(oi => oi.Product)
                    .Include(o => o.Items).ThenInclude(oi => oi.Addons).ThenInclude(a => a.ProductAddon)
                    .FirstOrDefaultAsync(o => o.Id == orderId, ct);

                if (order == null || order.Status == OrderStatus.Paid) return;

                order.Status = OrderStatus.Paid;

                foreach (var item in order.Items)
                {
                    if (item.Product.RequiresLicense)
                    {
                        db.LicenseKeys.Add(new LicenseKey
                        {
                            OrderItemId = item.Id,
                            KeyString = GenerateLicenseKey(),
                            MaxActivations = 1
                        });
                    }

                    if (item.Product.ProductType == ProductType.StandaloneService)
                    {
                        db.ServiceProjects.Add(new ServiceProject
                        {
                            OrderItemId = item.Id,
                            Status = ServiceProjectStatus.Pending
                        });

                        if (item.Product.BillingCycle is BillingCycle.Monthly or BillingCycle.Yearly)
                        {
                            var periodEnd = item.Product.BillingCycle == BillingCycle.Monthly
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

                    foreach (var addon in item.Addons)
                    {
                        db.ServiceProjects.Add(new ServiceProject
                        {
                            OrderItemAddonId = addon.Id,
                            Status = ServiceProjectStatus.Pending
                        });
                    }

                    await db.Products
                        .Where(p => p.Id == item.ProductId)
                        .ExecuteUpdateAsync(s => s.SetProperty(p => p.TotalSales, p => p.TotalSales + item.Quantity), ct);
                }

                db.Notifications.Add(new Notification
                {
                    UserId = order.UserId,
                    Title = "Thanh toán thành công!",
                    Message = $"Đơn hàng #{order.Id.ToString()[..8].ToUpper()} đã được xác nhận.",
                    Type = NotificationType.OrderConfirmed,
                    RedirectUrl = $"/orders/{order.Id}"
                });

                await db.SaveChangesAsync(ct);
            },
            ct: ct);
    }

    private static string GenerateLicenseKey()
    {
        var parts = Enumerable.Range(0, 4)
            .Select(_ => Guid.NewGuid().ToString("N")[..8].ToUpper());
        return string.Join("-", parts);
    }
}
