namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Product/service category with support for nested (parent-child) hierarchy.
/// </summary>
public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
    public string? Description { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Self-referencing for nested categories
    public Guid? ParentId { get; set; }
    public Category? Parent { get; set; }

    // Navigation properties
    public ICollection<Category> Children { get; set; } = [];
    public ICollection<Product> Products { get; set; } = [];
}
