using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.API.Controllers;

[Authorize]
public class WishlistController(IApplicationDbContext db) : BaseApiController
{
    /// <summary>Get current user's wishlist.</summary>
    [HttpGet]
    public async Task<IActionResult> GetMine(CancellationToken ct)
    {
        var items = await db.WishlistItems
            .Include(w => w.Product).ThenInclude(p => p.Files)
            .Include(w => w.Product).ThenInclude(p => p.Category)
            .Where(w => w.UserId == CurrentUserId && w.Product.IsActive)
            .AsNoTracking()
            .Select(w => new
            {
                w.ProductId,
                w.Product.Title,
                w.Product.Slug,
                w.Product.Price,
                w.Product.SalePrice,
                Thumbnail = w.Product.Files
                    .Where(f => f.FileType == Domain.Enums.FileType.Image)
                    .OrderBy(f => f.SortOrder)
                    .Select(f => f.FileUrl)
                    .FirstOrDefault(),
                Category = w.Product.Category!.Name,
                w.AddedAt
            })
            .OrderByDescending(w => w.AddedAt)
            .ToListAsync(ct);

        return Ok(items);
    }

    /// <summary>Add a product to wishlist (idempotent).</summary>
    [HttpPost("{productId:guid}")]
    public async Task<IActionResult> Add(Guid productId, CancellationToken ct)
    {
        var productExists = await db.Products.AnyAsync(p => p.Id == productId && p.IsActive, ct);
        if (!productExists) return NotFound(new { error = "Product not found." });

        var alreadyAdded = await db.WishlistItems
            .AnyAsync(w => w.UserId == CurrentUserId && w.ProductId == productId, ct);

        if (alreadyAdded) return Conflict(new { error = "Already in wishlist." });

        db.WishlistItems.Add(new WishlistItem
        {
            UserId = CurrentUserId,
            ProductId = productId,
            AddedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);
        return StatusCode(201);
    }

    /// <summary>Remove a product from wishlist.</summary>
    [HttpDelete("{productId:guid}")]
    public async Task<IActionResult> Remove(Guid productId, CancellationToken ct)
    {
        var item = await db.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == CurrentUserId && w.ProductId == productId, ct);

        if (item == null) return NotFound();

        db.WishlistItems.Remove(item);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>Check if a product is in user's wishlist.</summary>
    [HttpGet("{productId:guid}/check")]
    public async Task<IActionResult> Check(Guid productId, CancellationToken ct)
    {
        var exists = await db.WishlistItems
            .AnyAsync(w => w.UserId == CurrentUserId && w.ProductId == productId, ct);
        return Ok(new { inWishlist = exists });
    }
}
