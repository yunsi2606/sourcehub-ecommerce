using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.DTOs.Plan;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Enums;
using SourceEcommerce.Domain.Interfaces;
using System.Text.Json;
using SourceEcommerce.Domain.Entities;
using PlanTier = SourceEcommerce.Domain.Enums.PlanTier;
using Subscription = SourceEcommerce.Domain.Entities.Subscription;

namespace SourceEcommerce.Application.Services;

public class PlanService(
    IApplicationDbContext db,
    IStripeService stripeService)
{
    public async Task<List<PlanDto>> GetActivePlansAsync(CancellationToken ct = default)
    {
        var plans = await db.Plans
            .Where(p => p.IsActive)
            .OrderBy(p => p.Tier)
            .AsNoTracking()
            .ToListAsync(ct);

        return plans.Select(p => new PlanDto(
            p.Id, p.Name, p.Slug, p.Description, p.Tier,
            p.MonthlyPrice, p.YearlyPrice, p.IsActive,
            JsonSerializer.Deserialize<List<string>>(p.FeaturesJson) ?? []
        )).ToList();
    }

    public async Task<List<PlanDto>> GetAllPlansAsync(CancellationToken ct = default)
    {
        var plans = await db.Plans
            .OrderBy(p => p.Tier)
            .AsNoTracking()
            .ToListAsync(ct);

        return plans.Select(p => new PlanDto(
            p.Id, p.Name, p.Slug, p.Description, p.Tier,
            p.MonthlyPrice, p.YearlyPrice, p.IsActive,
            JsonSerializer.Deserialize<List<string>>(p.FeaturesJson) ?? []
        )).ToList();
    }

    public async Task<PlanDto> GetPlanByIdAsync(Guid id, CancellationToken ct = default)
    {
        var p = await db.Plans.FindAsync([id], ct) ?? throw new Exception("Plan not found");
        return new PlanDto(
            p.Id, p.Name, p.Slug, p.Description, p.Tier,
            p.MonthlyPrice, p.YearlyPrice, p.IsActive,
            JsonSerializer.Deserialize<List<string>>(p.FeaturesJson) ?? []
        );
    }

    public async Task<PlanDto> UpsertPlanAsync(Guid? id, UpsertPlanRequest req, CancellationToken ct = default)
    {
        Plan plan;
        if (id.HasValue && id.Value != Guid.Empty)
        {
            plan = await db.Plans.FindAsync([id.Value], ct) ?? throw new Exception("Plan not found");
        }
        else
        {
            plan = new Plan();
            db.Plans.Add(plan);
        }

        plan.Name = req.Name;
        plan.Slug = req.Slug;
        plan.Description = req.Description;
        plan.Tier = req.Tier;
        plan.MonthlyPrice = req.MonthlyPrice;
        plan.YearlyPrice = req.YearlyPrice;
        plan.IsActive = req.IsActive;
        plan.FeaturesJson = string.IsNullOrWhiteSpace(req.FeaturesJson) ? "[]" : req.FeaturesJson;
        plan.StripePriceIdMonthly = req.StripePriceIdMonthly;
        plan.StripePriceIdYearly = req.StripePriceIdYearly;

        await db.SaveChangesAsync(ct);

        return new PlanDto(
            plan.Id, plan.Name, plan.Slug, plan.Description, plan.Tier,
            plan.MonthlyPrice, plan.YearlyPrice, plan.IsActive,
            JsonSerializer.Deserialize<List<string>>(plan.FeaturesJson) ?? []
        );
    }

    public async Task<UserPlanDto> GetUserCurrentPlanAsync(Guid userId, CancellationToken ct = default)
    {
        var sub = await db.Subscriptions
            .Include(s => s.Plan)
            .Where(s => s.UserId == userId && s.PlanId != null && s.Status == SubscriptionStatus.Active)
            .OrderByDescending(s => s.CurrentPeriodEnd)
            .AsNoTracking()
            .FirstOrDefaultAsync(ct);

        if (sub == null || sub.Plan == null)
        {
            return new UserPlanDto(null, PlanTier.Free, "Free", "none", null, false, null);
        }

        return new UserPlanDto(
            sub.Id,
            sub.Plan.Tier,
            sub.Plan.Name,
            sub.BillingCycle.ToString().ToLower(),
            sub.CurrentPeriodEnd,
            sub.AutoRenew,
            sub.Status
        );
    }

    public async Task<string> CreateCheckoutSessionAsync(Guid userId, CreatePlanCheckoutRequest req, CancellationToken ct = default)
    {
        var plan = await db.Plans.FindAsync([req.PlanId], ct) 
            ?? throw new Exception("Plan not found");

        var user = await db.Users.FindAsync([userId], ct)
            ?? throw new Exception("User not found");

        var isYearly = req.BillingCycle.Equals("yearly", StringComparison.OrdinalIgnoreCase);
        var priceId = isYearly ? plan.StripePriceIdYearly : plan.StripePriceIdMonthly;
        var billingCycleEnum = isYearly ? BillingCycle.Yearly : BillingCycle.Monthly;

        if (string.IsNullOrEmpty(priceId))
            throw new Exception($"Stripe Price ID not configured for plan {plan.Name} ({req.BillingCycle})");

        // Ensure Stripe Customer exists
        var customerId = await stripeService.EnsureCustomerAsync(user.Email, user.Id.ToString(), user.FullName, ct);

        // Create pending subscription record
        var sub = new Subscription
        {
            UserId = userId,
            PlanId = plan.Id,
            BillingCycle = billingCycleEnum,
            Status = SubscriptionStatus.Pending,
            CurrentPeriodStart = DateTime.UtcNow,
            CurrentPeriodEnd = DateTime.UtcNow, // Will be updated on webhook
            StripeCustomerId = customerId
        };

        db.Subscriptions.Add(sub);
        await db.SaveChangesAsync(ct);

        // Create checkout session
        var checkoutUrl = await stripeService.CreateCheckoutSessionAsync(customerId, priceId, sub.Id.ToString(), ct);
        return checkoutUrl;
    }

    public async Task<string> CreateBillingPortalSessionAsync(Guid userId, CancellationToken ct = default)
    {
        var sub = await db.Subscriptions
            .Where(s => s.UserId == userId && s.PlanId != null && s.StripeCustomerId != null)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (sub == null || string.IsNullOrEmpty(sub.StripeCustomerId))
            throw new Exception("No active Stripe customer found for user.");

        return await stripeService.CreateBillingPortalSessionAsync(sub.StripeCustomerId, ct);
    }

    public async Task HandleStripeWebhookAsync(string payload, string signature, CancellationToken ct = default)
    {
        await stripeService.ProcessWebhookAsync(payload, signature, 
            async (planSubIdStr, stripeSubId, customerId) => 
            {
                if (Guid.TryParse(planSubIdStr, out var planSubId))
                {
                    var sub = await db.Subscriptions.FindAsync([planSubId], ct);
                    if (sub != null)
                    {
                        sub.Status = SubscriptionStatus.Active;
                        sub.StripeSubscriptionId = stripeSubId;
                        await db.SaveChangesAsync(ct);
                    }
                }
            },
            async (stripeSubId, periodStart, periodEnd) => 
            {
                var sub = await db.Subscriptions.FirstOrDefaultAsync(s => s.StripeSubscriptionId == stripeSubId, ct);
                if (sub != null)
                {
                    sub.CurrentPeriodStart = periodStart;
                    sub.CurrentPeriodEnd = periodEnd;
                    sub.Status = SubscriptionStatus.Active;
                    await db.SaveChangesAsync(ct);
                }
            },
            async (stripeSubId) => 
            {
                var dbSub = await db.Subscriptions.FirstOrDefaultAsync(s => s.StripeSubscriptionId == stripeSubId, ct);
                if (dbSub != null)
                {
                    dbSub.Status = SubscriptionStatus.Cancelled;
                    dbSub.CancelledAt = DateTime.UtcNow;
                    dbSub.AutoRenew = false;
                    await db.SaveChangesAsync(ct);
                }
            }, ct);
    }
}
