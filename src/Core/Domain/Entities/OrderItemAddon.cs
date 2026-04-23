namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Records an add-on selected by the customer for a specific order item.
/// Price is snapshotted at purchase time.
/// </summary>
public class OrderItemAddon : BaseEntity
{
    public Guid OrderItemId { get; set; }
    public OrderItem OrderItem { get; set; } = null!;

    public Guid ProductAddonId { get; set; }
    public ProductAddon ProductAddon { get; set; } = null!;

    /// <summary>Add-on price captured at time of purchase.</summary>
    public decimal PriceAtPurchase { get; set; }

    // Navigation properties
    /// <summary>If this add-on spawns a service delivery project.</summary>
    public ServiceProject? ServiceProject { get; set; }
}
