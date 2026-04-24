namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Category dedicated to Blog posts. Separate from product catalog categories.
/// </summary>
public class BlogCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation
    public ICollection<Post> Posts { get; set; } = [];
}
