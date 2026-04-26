using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Application.DTOs.Plan;

// Public plan list item
public record PlanDto(
    Guid Id,
    string Name,
    string Slug,
    string Description,
    PlanTier Tier,
    decimal MonthlyPrice,
    decimal YearlyPrice,
    bool IsActive,
    List<string> Features,
    string Currency = "VND"
);

// User's current plan info
public record UserPlanDto(
    Guid? PlanSubscriptionId,
    PlanTier Tier,
    string PlanName,
    string BillingCycle,
    DateTime? PeriodEnd,
    bool AutoRenew,
    SubscriptionStatus? Status
);

// Request to start subscription checkout
public record CreatePlanCheckoutRequest(
    Guid PlanId,
    string BillingCycle // "monthly" or "yearly"
);

// Admin Upsert
public record UpsertPlanRequest(
    string Name,
    string Description,
    decimal MonthlyPrice,
    decimal YearlyPrice,
    string FeaturesJson,
    string? StripePriceIdMonthly,
    string? StripePriceIdYearly
);
