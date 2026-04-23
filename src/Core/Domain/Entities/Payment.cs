using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Represents a payment attempt for an order.
/// Multiple records may exist per order (e.g., retries after failure).
/// </summary>
public class Payment : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public PaymentGateway PaymentGateway { get; set; }

    /// <summary>Transaction ID returned by the payment gateway.</summary>
    public string? TransactionId { get; set; }

    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateTime? PaidAt { get; set; }

    /// <summary>Raw webhook/callback payload stored as JSON for auditing and reconciliation.</summary>
    public string? Metadata { get; set; }

    // Navigation for SubscriptionPayment
    public ICollection<SubscriptionPayment> SubscriptionPayments { get; set; } = [];
}
