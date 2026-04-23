using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.DTOs.Subscription;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.API.Controllers;

[Authorize]
public class SubscriptionsController(IApplicationDbContext db) : BaseApiController
{
    /// <summary>List current user's active subscriptions.</summary>
    [HttpGet("my")]
    public async Task<IActionResult> GetMine(CancellationToken ct)
    {
        var userId = CurrentUserId;
        var subs = await db.Subscriptions
            .Include(s => s.OrderItem).ThenInclude(oi => oi.Product)
            .Include(s => s.Payments).ThenInclude(sp => sp.Payment)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CurrentPeriodEnd)
            .AsNoTracking()
            .Select(s => new SubscriptionDto(
                s.Id,
                s.OrderItemId,
                s.OrderItem.Product.Title,
                s.Status,
                s.AutoRenew,
                s.CurrentPeriodStart,
                s.CurrentPeriodEnd,
                s.CancelledAt,
                s.Payments.Select(p => new SubscriptionPaymentDto(
                    p.Id, p.Payment.Amount, p.Payment.Status,
                    p.PeriodStart, p.PeriodEnd, p.Payment.PaidAt)).ToList()))
            .ToListAsync(ct);

        return Ok(subs);
    }

    /// <summary>Toggle auto-renew for a subscription.</summary>
    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSubscriptionRequest req, CancellationToken ct)
    {
        var sub = await db.Subscriptions.FirstOrDefaultAsync(s => s.Id == id && s.UserId == CurrentUserId, ct);
        if (sub == null) return NotFound();

        sub.AutoRenew = req.AutoRenew;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>Cancel a subscription (sets status to Cancelled).</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        var sub = await db.Subscriptions.FirstOrDefaultAsync(s => s.Id == id && s.UserId == CurrentUserId, ct);
        if (sub == null) return NotFound();
        if (sub.Status == SubscriptionStatus.Cancelled) return BadRequest(new { error = "Already cancelled." });

        sub.Status = SubscriptionStatus.Cancelled;
        sub.AutoRenew = false;
        sub.CancelledAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // Admin

    /// <summary>Admin: list all subscriptions.</summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] SubscriptionStatus? status, CancellationToken ct)
    {
        var query = db.Subscriptions
            .Include(s => s.OrderItem).ThenInclude(oi => oi.Product)
            .Include(s => s.Payments).ThenInclude(sp => sp.Payment)
            .AsNoTracking();

        if (status.HasValue) query = query.Where(s => s.Status == status);

        var result = await query
            .OrderByDescending(s => s.CurrentPeriodEnd)
            .Select(s => new SubscriptionDto(
                s.Id, s.OrderItemId, s.OrderItem.Product.Title,
                s.Status, s.AutoRenew,
                s.CurrentPeriodStart, s.CurrentPeriodEnd, s.CancelledAt,
                s.Payments.Select(p => new SubscriptionPaymentDto(
                    p.Id, p.Payment.Amount, p.Payment.Status, p.PeriodStart, p.PeriodEnd, p.Payment.PaidAt)).ToList()))
            .ToListAsync(ct);

        return Ok(result);
    }
}
