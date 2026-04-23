using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Recurring service subscription (e.g., VPS rental billed monthly/yearly).
/// Created after a successful payment for a StandaloneService with BillingCycle != OneTime.
/// </summary>
public class Subscription : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid? OrderItemId { get; set; }
    public OrderItem? OrderItem { get; set; }

    public Guid? PlanId { get; set; }
    public Plan? Plan { get; set; }

    public BillingCycle BillingCycle { get; set; }
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;

    public DateTime CurrentPeriodStart { get; set; }
    public DateTime CurrentPeriodEnd { get; set; }

    public bool AutoRenew { get; set; } = true;
    public DateTime? CancelledAt { get; set; }

    // Stripe IDs for billing management
    public string? StripeCustomerId { get; set; }
    public string? StripeSubscriptionId { get; set; }

    // Navigation properties
    public ICollection<SubscriptionPayment> Payments { get; set; } = [];
}
