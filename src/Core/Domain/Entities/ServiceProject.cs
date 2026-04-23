using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Tracks the delivery lifecycle of a service — either a StandaloneService product
/// or an add-on service selected at checkout.
/// Auto-created when a paid order contains a service item.
/// </summary>
public class ServiceProject : BaseEntity
{
    /// <summary>Set when project originates from a standalone service product purchase.</summary>
    public Guid? OrderItemId { get; set; }
    public OrderItem? OrderItem { get; set; }

    /// <summary>Set when project originates from an add-on service selected at checkout.</summary>
    public Guid? OrderItemAddonId { get; set; }
    public OrderItemAddon? OrderItemAddon { get; set; }

    public ServiceProjectStatus Status { get; set; } = ServiceProjectStatus.Pending;

    /// <summary>Internal admin notes (not visible to customer).</summary>
    public string? AdminNote { get; set; }

    /// <summary>Customer's service requirements or special requests.</summary>
    public string? CustomerNote { get; set; }

    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? DeadlineAt { get; set; }
}
