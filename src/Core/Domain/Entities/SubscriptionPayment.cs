namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Records each billing cycle payment for a subscription (renewal history).
/// </summary>
public class SubscriptionPayment : BaseEntity
{
    public Guid SubscriptionId { get; set; }
    public Subscription Subscription { get; set; } = null!;

    public Guid PaymentId { get; set; }
    public Payment Payment { get; set; } = null!;

    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
}
