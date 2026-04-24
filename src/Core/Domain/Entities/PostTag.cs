namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Many-to-many join table between Post and Tag.
/// Tags are shared with the product catalog (same Tag entity).
/// </summary>
public class PostTag
{
    public Guid PostId { get; set; }
    public Post Post { get; set; } = null!;

    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}
