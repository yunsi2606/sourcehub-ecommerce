using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Core product entity. Covers both source code products and standalone IT services.
/// </summary>
public class Product : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    /// <summary>Full rich-text description (HTML/Markdown).</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>Short description shown in product cards.</summary>
    public string ShortDescription { get; set; } = string.Empty;

    public decimal Price { get; set; }

    /// <summary>Optional promotional price. If set and lower than Price, displayed as sale.</summary>
    public decimal? SalePrice { get; set; }

    public ProductType ProductType { get; set; }

    /// <summary>
    /// Billing cycle. Only applicable when ProductType = StandaloneService.
    /// Null means one-time purchase (also applies to all SourceCode products).
    /// </summary>
    public BillingCycle? BillingCycle { get; set; }
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;

    /// <summary>When true, a LicenseKey is generated for each OrderItem.</summary>
    public bool RequiresLicense { get; set; } = false;

    /// <summary>External demo URL (e.g. live preview link).</summary>
    public string? DemoUrl { get; set; }

    /// <summary>Comma-separated or JSON array of tech stack labels.</summary>
    public string? TechStack { get; set; }

    public int TotalSales { get; set; } = 0;
    public double AverageRating { get; set; } = 0;

    // Navigation properties
    public ICollection<ProductFile> Files { get; set; } = [];
    public ICollection<ProductTag> ProductTags { get; set; } = [];
    public ICollection<ProductAddon> Addons { get; set; } = [];
    public ICollection<OrderItem> OrderItems { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
    public ICollection<WishlistItem> WishlistItems { get; set; } = [];
}
