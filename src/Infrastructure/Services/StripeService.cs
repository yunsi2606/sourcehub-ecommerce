using Microsoft.Extensions.Options;
using SourceEcommerce.Domain.Interfaces;
using Stripe;
using Stripe.Checkout;

namespace SourceEcommerce.Infrastructure.Services;

public class StripeService : IStripeService
{
    private readonly StripeOptions _options;

    public StripeService(IOptions<StripeOptions> options)
    {
        _options = options.Value;
        StripeConfiguration.ApiKey = _options.SecretKey;
    }

    public async Task<string> EnsureCustomerAsync(string email, string userId, string name, CancellationToken ct = default)
    {
        var customerService = new CustomerService();

        // Search for existing customer
        var searchOptions = new CustomerSearchOptions
        {
            Query = $"email:'{email}'",
            Limit = 1
        };

        var existingCustomers = await customerService.SearchAsync(searchOptions, cancellationToken: ct);
        if (existingCustomers.Data.Any())
        {
            return existingCustomers.Data.First().Id;
        }

        // Create new
        var createOptions = new CustomerCreateOptions
        {
            Email = email,
            Name = name,
            Metadata = new Dictionary<string, string>
            {
                { "UserId", userId }
            }
        };

        var customer = await customerService.CreateAsync(createOptions, cancellationToken: ct);
        return customer.Id;
    }

    public async Task<string> CreateCheckoutSessionAsync(string customerId, string stripePriceId, string planSubscriptionId, CancellationToken ct = default)
    {
        var options = new SessionCreateOptions
        {
            Customer = customerId,
            Mode = "subscription",
            PaymentMethodTypes = ["card"],
            LineItems =
            [
                new SessionLineItemOptions
                {
                    Price = stripePriceId,
                    Quantity = 1,
                }
            ],
            SuccessUrl = _options.SuccessUrl,
            CancelUrl = _options.CancelUrl,
            // Pass our internal ID via subscription metadata so the webhook can link it
            SubscriptionData = new SessionSubscriptionDataOptions
            {
                Metadata = new Dictionary<string, string>
                {
                    { "PlanSubscriptionId", planSubscriptionId }
                }
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options, cancellationToken: ct);

        return session.Url;
    }

    public async Task<string> CreateOrderCheckoutSessionAsync(
        string customerId,
        string orderId,
        string paymentId,
        List<(string name, long amountVnd, long quantity)> lineItems,
        CancellationToken ct = default)
    {
        var options = new SessionCreateOptions
        {
            Customer = customerId,
            Mode = "payment",
            PaymentMethodTypes = ["card"],
            LineItems = lineItems.Select(li => new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "vnd",
                    UnitAmount = li.amountVnd, // VND: no smallest unit conversion needed (1 VND = 1)
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = li.name
                    }
                },
                Quantity = li.quantity
            }).ToList(),
            SuccessUrl = _options.SuccessUrl.Replace("{ORDER_ID}", orderId),
            CancelUrl = _options.CancelUrl,
            Metadata = new Dictionary<string, string>
            {
                { "OrderId", orderId },
                { "PaymentId", paymentId }
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options, cancellationToken: ct);
        return session.Url;
    }

    public async Task<string> CreateBillingPortalSessionAsync(string customerId, CancellationToken ct = default)
    {
        var options = new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = customerId,
            ReturnUrl = _options.CancelUrl,
        };

        var service = new Stripe.BillingPortal.SessionService();
        var session = await service.CreateAsync(options, cancellationToken: ct);

        return session.Url;
    }

    public async Task ProcessWebhookAsync(
        string payload,
        string signature,
        Func<string, string, string, Task> onCheckoutCompleted,
        Func<string, DateTime, DateTime, Task> onInvoicePaid,
        Func<string, Task> onSubscriptionDeleted,
        Func<string, string, Task>? onOrderPaymentCompleted,
        CancellationToken ct = default)
    {
        var stripeEvent = EventUtility.ConstructEvent(payload, signature, _options.WebhookSecret);

        switch (stripeEvent.Type)
        {
            case EventTypes.CheckoutSessionCompleted:
                if (stripeEvent.Data.Object is Session session)
                {
                    // Order one-time payment (mode=payment)
                    if (session.Mode == "payment" && session.Metadata.TryGetValue("OrderId", out var orderId)
                        && session.Metadata.TryGetValue("PaymentId", out var paymentId)
                        && onOrderPaymentCompleted != null)
                    {
                        await onOrderPaymentCompleted(orderId, paymentId);
                    }
                    // Plan subscription (mode=subscription)
                    else if (session.Mode == "subscription")
                    {
                        var subId = session.SubscriptionId;
                        var customerId = session.CustomerId;

                        if (!string.IsNullOrEmpty(subId))
                        {
                            var subService = new SubscriptionService();
                            var stripeSub = await subService.GetAsync(subId, cancellationToken: ct);

                            if (stripeSub.Metadata.TryGetValue("PlanSubscriptionId", out var planSubIdStr))
                            {
                                await onCheckoutCompleted(planSubIdStr, subId, customerId ?? "");
                            }
                        }
                    }
                }
                break;

            case EventTypes.InvoicePaid:
                // v51: SubscriptionId moved to Invoice.Parent.SubscriptionDetails.SubscriptionId
                var invoice = stripeEvent.Data.Object as Invoice;
                var subIdFromInvoice = invoice?.Parent?.SubscriptionDetails?.SubscriptionId;
                if (invoice != null && !string.IsNullOrEmpty(subIdFromInvoice))
                {
                    var line = invoice.Lines?.Data.FirstOrDefault();
                    if (line != null)
                    {
                        await onInvoicePaid(subIdFromInvoice, line.Period.Start, line.Period.End);
                    }
                }
                break;

            case EventTypes.CustomerSubscriptionDeleted:
                if (stripeEvent.Data.Object is Subscription deletedSub)
                {
                    await onSubscriptionDeleted(deletedSub.Id);
                }
                break;
        }
    }

    public async Task<bool> CreateRefundAsync(string stripeSubscriptionId, CancellationToken ct = default)
    {
        // v51: Retrieve subscription with expanded latest_invoice and its payments
        var subscription = await new SubscriptionService().GetAsync(
            stripeSubscriptionId,
            new SubscriptionGetOptions { Expand = ["latest_invoice", "latest_invoice.payments"] },
            cancellationToken: ct);

        var latestInvoice = subscription.LatestInvoice;
        if (latestInvoice == null) return false;

        // v51: PaymentIntentId is under Invoice.Payments[0].Payment.PaymentIntentId
        var paymentIntentId = latestInvoice.Payments?.Data?.FirstOrDefault()?.Payment?.PaymentIntentId;
        if (string.IsNullOrEmpty(paymentIntentId)) return false;

        var refund = await new RefundService().CreateAsync(new RefundCreateOptions
        {
            PaymentIntent = paymentIntentId,
            Reason = RefundReasons.RequestedByCustomer
        }, cancellationToken: ct);

        return refund.Status is "succeeded" or "pending";
    }
}
