namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// License key generated for source code products that require licensing.
/// Created automatically after an order is successfully paid.
/// </summary>
public class LicenseKey : BaseEntity
{
    public Guid OrderItemId { get; set; }
    public OrderItem OrderItem { get; set; } = null!;

    public string KeyString { get; set; } = string.Empty;
    public bool IsActivated { get; set; } = false;
    public DateTime? ActivatedAt { get; set; }

    /// <summary>Maximum number of domain/device activations allowed.</summary>
    public int MaxActivations { get; set; } = 1;
    public int CurrentActivations { get; set; } = 0;
}
