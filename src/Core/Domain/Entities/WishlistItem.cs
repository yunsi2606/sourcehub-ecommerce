namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Junction table for user wishlists (many-to-many: User - Product).
/// Uses composite primary key (UserId + ProductId).
/// </summary>
public class WishlistItem
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
