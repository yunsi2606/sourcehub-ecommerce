namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Junction table for the many-to-many relationship between Product and Tag.
/// </summary>
public class ProductTag
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}
