namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Product review. Only users who have purchased the product can leave a review.
/// Requires admin approval before being publicly visible.
/// </summary>
public class Review : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    /// <summary>Validated purchase — ensures only buyers can review.</summary>
    public Guid OrderItemId { get; set; }
    public OrderItem OrderItem { get; set; } = null!;

    /// <summary>Rating from 1 to 5.</summary>
    public int Rating { get; set; }

    public string? Comment { get; set; }

    /// <summary>Review is hidden until approved by an admin.</summary>
    public bool IsApproved { get; set; } = false;
}
