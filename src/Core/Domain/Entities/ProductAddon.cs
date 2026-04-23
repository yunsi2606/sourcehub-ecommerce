namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// An add-on service that can be purchased alongside a specific product at checkout.
/// Example: "Deploy to server", "1-month support", "Custom branding".
/// </summary>
public class ProductAddon : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<OrderItemAddon> OrderItemAddons { get; set; } = [];
}
