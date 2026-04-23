using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.DTOs.Order;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Entities;
using SourceEcommerce.Domain.Enums;
using SourceEcommerce.Domain.Interfaces;

namespace SourceEcommerce.Application.Services;

public class DownloadService(IApplicationDbContext db, IStorageService storage)
{
    /// <summary>
    /// Validates user access and generates a pre-signed download URL.
    /// Logs each download attempt to the Download table.
    /// </summary>
    public async Task<DownloadUrlResponse> GetDownloadUrlAsync(
        Guid userId,
        Guid orderItemId,
        Guid productFileId,
        string? ipAddress,
        string? userAgent,
        CancellationToken ct = default)
    {
        // 1. Verify the OrderItem belongs to a paid order owned by this user
        var orderItem = await db.OrderItems
            .Include(oi => oi.Order)
            .Include(oi => oi.Product)
            .FirstOrDefaultAsync(oi =>
                oi.Id == orderItemId &&
                oi.Order.UserId == userId &&
                oi.Order.Status == OrderStatus.Paid, ct)
            ?? throw new UnauthorizedAccessException("Access denied: order item not found or order not paid.");

        // 2. Verify the file belongs to the purchased product
        var file = await db.ProductFiles
            .FirstOrDefaultAsync(f =>
                f.Id == productFileId &&
                f.ProductId == orderItem.ProductId &&
                f.FileType == FileType.SourceCodeArchive, ct)
            ?? throw new InvalidOperationException("File not found or not a downloadable archive.");

        // 3. Generate pre-signed URL from R2 private bucket
        var presignedUrl = await storage.GetPresignedDownloadUrlAsync(
            file.FileUrl,
            expirySeconds: 300,
            ct: ct);

        // 4. Log download record
        db.Downloads.Add(new Download
        {
            UserId = userId,
            OrderItemId = orderItemId,
            ProductFileId = productFileId,
            DownloadedAt = DateTime.UtcNow,
            IpAddress = ipAddress,
            UserAgent = userAgent
        });
        await db.SaveChangesAsync(ct);

        return new DownloadUrlResponse(
            presignedUrl,
            file.FileName,
            file.FileSize,
            DateTime.UtcNow.AddSeconds(300)
        );
    }

    /// <summary>List all products the user has purchased and is eligible to download.</summary>
    public async Task<List<OrderItemDto>> GetMyDownloadsAsync(Guid userId, CancellationToken ct = default)
    {
        return await db.OrderItems
            .Include(oi => oi.Order)
            .Include(oi => oi.Product).ThenInclude(p => p.Files)
            .Include(oi => oi.Addons).ThenInclude(a => a.ProductAddon)
            .Where(oi =>
                oi.Order.UserId == userId &&
                oi.Order.Status == OrderStatus.Paid &&
                oi.Product.ProductType == ProductType.SourceCode)
            .AsNoTracking()
            .Select(oi => new OrderItemDto(
                oi.Id,
                oi.ProductId,
                oi.Product.Title,
                oi.Product.Slug,
                oi.Product.Files.FirstOrDefault(f => f.FileType == FileType.Image) != null
                    ? oi.Product.Files.FirstOrDefault(f => f.FileType == FileType.Image)!.FileUrl
                    : null,
                oi.PriceAtPurchase,
                oi.Quantity,
                oi.Addons.Select(a => new OrderItemAddonDto(
                    a.ProductAddonId, a.ProductAddon.Name, a.PriceAtPurchase)).ToList()
            ))
            .ToListAsync(ct);
    }
}
