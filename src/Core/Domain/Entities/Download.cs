namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Tracks each file download by a user.
/// Used for access control validation and download-limit enforcement.
/// </summary>
public class Download : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    /// <summary>The order item that grants download access.</summary>
    public Guid OrderItemId { get; set; }
    public OrderItem OrderItem { get; set; } = null!;

    public Guid ProductFileId { get; set; }
    public ProductFile ProductFile { get; set; } = null!;

    public DateTime DownloadedAt { get; set; } = DateTime.UtcNow;
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}
