using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Represents a customer purchase. One order may contain multiple OrderItems.
/// </summary>
public class Order : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal TotalAmount { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    /// <summary>Customer notes at checkout.</summary>
    public string? Notes { get; set; }

    // Navigation properties
    public ICollection<OrderItem> Items { get; set; } = [];
    public ICollection<Payment> Payments { get; set; } = [];
}
