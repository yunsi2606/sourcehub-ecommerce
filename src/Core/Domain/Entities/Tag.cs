namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Tag for filtering and searching products.
/// </summary>
public class Tag : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<ProductTag> ProductTags { get; set; } = [];
}
