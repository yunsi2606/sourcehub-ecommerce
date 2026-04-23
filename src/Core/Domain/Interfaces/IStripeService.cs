namespace SourceEcommerce.Domain.Interfaces;

public interface IStripeService
{
    Task<string> EnsureCustomerAsync(string email, string userId, string name, CancellationToken ct = default);
    Task<string> CreateCheckoutSessionAsync(string customerId, string stripePriceId, string planSubscriptionId, CancellationToken ct = default);
    Task<string> CreateBillingPortalSessionAsync(string customerId, CancellationToken ct = default);
    
    /// <summary>Validates the webhook signature and processes the payload. Implementation will dispatch internal domain events or handle directly.</summary>
    Task ProcessWebhookAsync(string payload, string signature, Func<string, string, string, Task> onCheckoutCompleted, Func<string, DateTime, DateTime, Task> onInvoicePaid, Func<string, Task> onSubscriptionDeleted, CancellationToken ct = default);
    
    Task<bool> CreateRefundAsync(string stripeSubscriptionId, CancellationToken ct = default);
}
