using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.DTOs.Review;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.API.Controllers;

public class ReviewsController(IApplicationDbContext db) : BaseApiController
{
    /// <summary>Get approved reviews for a product (public).</summary>
    [HttpGet("product/{productId:guid}")]
    public async Task<IActionResult> GetByProduct(Guid productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        var query = db.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == productId && r.IsApproved)
            .AsNoTracking();

        var total = await query.CountAsync(ct);
        var avg = total > 0 ? await query.AverageAsync(r => (double)r.Rating, ct) : 0;

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(r => new ReviewDto(
                r.Id, r.UserId, r.User.FullName,
                r.User.AvatarUrl, r.ProductId,
                r.Rating, r.Comment, r.IsApproved, r.CreatedAt))
            .ToListAsync(ct);

        return Ok(new ReviewListResponse(items, avg, total, page, pageSize));
    }

    /// <summary>Create a review for a purchased product.</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateReviewRequest req, CancellationToken ct)
    {
        var userId = CurrentUserId;

        // Verify user purchased this product
        var hasPurchased = await db.OrderItems
            .AnyAsync(oi =>
                oi.Id == req.OrderItemId &&
                oi.ProductId == req.ProductId &&
                oi.Order.UserId == userId &&
                oi.Order.Status == Domain.Enums.OrderStatus.Paid, ct);

        if (!hasPurchased)
            return BadRequest(new { error = "You can only review products you have purchased." });

        // Check for duplicate review
        var alreadyReviewed = await db.Reviews
            .AnyAsync(r => r.UserId == userId && r.ProductId == req.ProductId, ct);

        if (alreadyReviewed)
            return Conflict(new { error = "You have already reviewed this product." });

        var review = new Review
        {
            UserId = userId,
            ProductId = req.ProductId,
            OrderItemId = req.OrderItemId,
            Rating = req.Rating,
            Comment = req.Comment,
            IsApproved = false // Requires admin approval
        };

        db.Reviews.Add(review);
        await db.SaveChangesAsync(ct);
        return StatusCode(201, new { review.Id, message = "Review submitted and pending approval." });
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    /// <summary>Admin: approve a review.</summary>
    [HttpPatch("{id:guid}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct)
    {
        var review = await db.Reviews.FindAsync([id], ct);
        if (review == null) return NotFound();

        review.IsApproved = true;
        await db.SaveChangesAsync(ct);

        // Recalculate product average rating
        var avg = await db.Reviews
            .Where(r => r.ProductId == review.ProductId && r.IsApproved)
            .AverageAsync(r => (double)r.Rating, ct);

        await db.Products
            .Where(p => p.Id == review.ProductId)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.AverageRating, avg), ct);

        return NoContent();
    }

    /// <summary>Admin: delete a review.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var review = await db.Reviews.FindAsync([id], ct);
        if (review == null) return NotFound();

        db.Reviews.Remove(review);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
