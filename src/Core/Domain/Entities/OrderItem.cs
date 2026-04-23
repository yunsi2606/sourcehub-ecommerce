namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// A single line item within an order (one product per item).
/// Price is snapshotted at the time of purchase to preserve revenue history.
/// </summary>
public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    /// <summary>Price captured at the moment of purchase — never changes after order is placed.</summary>
    public decimal PriceAtPurchase { get; set; }

    /// <summary>Typically 1 for digital products; can be > 1 for license seat bundles.</summary>
    public int Quantity { get; set; } = 1;

    // Navigation properties
    public ICollection<OrderItemAddon> Addons { get; set; } = [];
    public ICollection<Download> Downloads { get; set; } = [];
    public LicenseKey? LicenseKey { get; set; }
    public ServiceProject? ServiceProject { get; set; }
    public Subscription? Subscription { get; set; }
    public Review? Review { get; set; }
}
