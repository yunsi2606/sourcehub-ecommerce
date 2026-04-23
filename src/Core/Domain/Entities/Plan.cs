using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Represents a platform membership tier (Hobby, Pro, Enterprise).
/// </summary>
public class Plan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PlanTier Tier { get; set; } = PlanTier.Free;
    
    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    /// <summary>JSON array of features for display.</summary>
    public string FeaturesJson { get; set; } = "[]";
    
    // Stripe mappings
    public string? StripePriceIdMonthly { get; set; }
    public string? StripePriceIdYearly { get; set; }
    
    // Navigation
    public ICollection<Subscription> Subscriptions { get; set; } = [];
}
