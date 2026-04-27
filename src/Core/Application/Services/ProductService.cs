using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.DTOs.Product;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Entities;
using SourceEcommerce.Domain.Enums;
using SourceEcommerce.Domain.Interfaces;

namespace SourceEcommerce.Application.Services;

public class ProductService(IApplicationDbContext db, IStorageService storage)
{
    public async Task<ProductListResponse> GetListAsync(ProductQueryParams q, CancellationToken ct = default)
    {
        var query = db.Products
            .Include(p => p.Category)
            .Include(p => p.ProductTags).ThenInclude(pt => pt.Tag)
            .Include(p => p.Files)
            .AsNoTracking()
            .Where(p => q.IsActive == null || p.IsActive == q.IsActive);

        if (!string.IsNullOrWhiteSpace(q.Search))
            query = query.Where(p => EF.Functions.ILike(p.Title, $"%{q.Search}%") ||
                                     EF.Functions.ILike(p.ShortDescription, $"%{q.Search}%"));

        if (q.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == q.CategoryId);
        else if (!string.IsNullOrWhiteSpace(q.CategorySlug))
            query = query.Where(p => p.Category != null && p.Category.Slug == q.CategorySlug);

        if (q.TagIds is { Count: > 0 })
            query = query.Where(p => p.ProductTags.Any(pt => q.TagIds.Contains(pt.TagId)));
        else if (!string.IsNullOrWhiteSpace(q.TagSlug))
            query = query.Where(p => p.ProductTags.Any(pt => pt.Tag.Slug == q.TagSlug));

        if (q.ProductType.HasValue) query = query.Where(p => p.ProductType == q.ProductType);
        if (q.IsFeatured.HasValue) query = query.Where(p => p.IsFeatured == q.IsFeatured);
        if (q.MinPrice.HasValue) query = query.Where(p => (p.SalePrice ?? p.Price) >= q.MinPrice);
        if (q.MaxPrice.HasValue) query = query.Where(p => (p.SalePrice ?? p.Price) <= q.MaxPrice);

        query = q.SortBy.ToLower() switch
        {
            "price"  => q.SortDesc ? query.OrderByDescending(p => p.SalePrice ?? p.Price)
                                   : query.OrderBy(p => p.SalePrice ?? p.Price),
            "rating" => q.SortDesc ? query.OrderByDescending(p => p.AverageRating)
                                   : query.OrderBy(p => p.AverageRating),
            "sales"  => q.SortDesc ? query.OrderByDescending(p => p.TotalSales)
                                   : query.OrderBy(p => p.TotalSales),
            _        => q.SortDesc ? query.OrderByDescending(p => p.CreatedAt)
                                   : query.OrderBy(p => p.CreatedAt)
        };

        var total = await query.CountAsync(ct);
        var items = await query.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);

        return new ProductListResponse(items.Select(ToSummary), total, q.Page, q.PageSize);
    }

    public async Task<ProductDetailDto?> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var p = await db.Products
            .Include(p => p.Category)
            .Include(p => p.ProductTags).ThenInclude(pt => pt.Tag)
            .Include(p => p.Files)
            .Include(p => p.Addons.Where(a => a.IsActive))
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive, ct);

        return p == null ? null : ToDetail(p);
    }

    public async Task<ProductDetailDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var p = await db.Products
            .Include(p => p.Category)
            .Include(p => p.ProductTags).ThenInclude(pt => pt.Tag)
            .Include(p => p.Files)
            .Include(p => p.Addons)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        return p == null ? null : ToDetail(p);
    }

    public async Task<ProductDetailDto> CreateAsync(CreateProductRequest req, CancellationToken ct = default)
    {
        var product = new Product
        {
            Title = req.Title,
            Slug = GenerateSlug(req.Title),
            Description = req.Description,
            ShortDescription = req.ShortDescription,
            Price = req.Price,
            SalePrice = req.SalePrice,
            ProductType = req.ProductType,
            BillingCycle = req.BillingCycle,
            CategoryId = req.CategoryId,
            RequiresLicense = req.RequiresLicense,
            DemoUrl = req.DemoUrl,
            TechStack = req.TechStack,
        };

        if (req.TagIds.Count > 0)
        {
            product.ProductTags = req.TagIds.Select(tid => new ProductTag
            {
                ProductId = product.Id,
                TagId = tid
            }).ToList();
        }

        db.Products.Add(product);
        await db.SaveChangesAsync(ct);

        if (!string.IsNullOrWhiteSpace(req.ThumbnailUrl) && req.ThumbnailUrl.StartsWith("temp/"))
        {
            var fileName = req.ThumbnailUrl.Split('/').Last();
            var destKey = $"{DateTime.UtcNow:yyyy/MM/dd}/products/{product.Id}/{fileName}";
            
            await storage.CopyAsync(req.ThumbnailUrl, destKey, true, ct);
            
            db.ProductFiles.Add(new ProductFile
            {
                ProductId = product.Id,
                FileType = FileType.Image,
                FileUrl = destKey,
                FileName = fileName,
                IsPreview = true,
                SortOrder = 0
            });
            await db.SaveChangesAsync(ct);
        }

        return (await GetByIdAsync(product.Id, ct))!;
    }

    public async Task<ProductDetailDto?> UpdateAsync(Guid id, UpdateProductRequest req, CancellationToken ct = default)
    {
        var product = await db.Products
            .Include(p => p.ProductTags)
            .Include(p => p.Files)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (product == null) return null;

        if (req.Title != null) { product.Title = req.Title; product.Slug = GenerateSlug(req.Title); }
        if (req.Description != null) product.Description = req.Description;
        if (req.ShortDescription != null) product.ShortDescription = req.ShortDescription;
        if (req.Price.HasValue) product.Price = req.Price.Value;
        if (req.SalePrice.HasValue) product.SalePrice = req.SalePrice.Value;
        if (req.IsActive.HasValue) product.IsActive = req.IsActive.Value;
        if (req.IsFeatured.HasValue) product.IsFeatured = req.IsFeatured.Value;
        if (req.RequiresLicense.HasValue) product.RequiresLicense = req.RequiresLicense.Value;
        if (req.DemoUrl != null) product.DemoUrl = req.DemoUrl;
        if (req.TechStack != null) product.TechStack = req.TechStack;
        if (req.CategoryId.HasValue) product.CategoryId = req.CategoryId.Value;

        if (req.TagIds != null)
        {
            db.ProductTags.RemoveRange(product.ProductTags);
            product.ProductTags = req.TagIds.Select(tid => new ProductTag
            {
                ProductId = product.Id,
                TagId = tid
            }).ToList();
        }

        if (!string.IsNullOrWhiteSpace(req.ThumbnailUrl) && req.ThumbnailUrl.StartsWith("temp/"))
        {
            var fileName = req.ThumbnailUrl.Split('/').Last();
            var destKey = $"{DateTime.UtcNow:yyyy/MM/dd}/products/{product.Id}/{fileName}";
            
            await storage.CopyAsync(req.ThumbnailUrl, destKey, true, ct);
            
            var oldThumb = product.Files.FirstOrDefault(f => f.IsPreview && f.FileType == FileType.Image);
            if (oldThumb != null)
            {
                await storage.DeleteAsync(oldThumb.FileUrl, true, ct);
                db.ProductFiles.Remove(oldThumb);
            }
            
            product.Files.Add(new ProductFile
            {
                ProductId = product.Id,
                FileType = FileType.Image,
                FileUrl = destKey,
                FileName = fileName,
                IsPreview = true,
                SortOrder = 0
            });
        }

        await db.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var product = await db.Products.FindAsync([id], ct);
        if (product == null) return false;

        product.IsActive = false; // Soft delete
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<ProductFileDto> UploadFileAsync(Guid productId, Stream fileStream, string fileName, string contentType, FileType fileType, bool isPreview, CancellationToken ct = default)
    {
        var product = await db.Products.FindAsync([productId], ct);
        if (product == null) throw new Exception("Product not found");

        var isPublic = fileType == FileType.Image || fileType == FileType.Video;
        var objectKey = await storage.UploadAsync(fileStream, fileName, contentType, isPublic, null, ct);

        var productFile = new ProductFile
        {
            ProductId = productId,
            FileType = fileType,
            FileUrl = objectKey,
            FileName = fileName,
            FileSize = fileStream.Length,
            IsPreview = isPreview,
            SortOrder = (isPreview && isPublic) ? -1 : await db.ProductFiles.CountAsync(f => f.ProductId == productId, ct)
        };

        db.ProductFiles.Add(productFile);
        await db.SaveChangesAsync(ct);

        return new ProductFileDto(
            productFile.Id,
            productFile.FileType,
            isPublic ? storage.GetPublicUrl(objectKey) : "",
            productFile.FileName,
            productFile.FileSize,
            productFile.SortOrder,
            productFile.IsPreview
        );
    }

    // Mappers

    private ProductSummaryDto ToSummary(Product p)
    {
        var thumb = p.Files.FirstOrDefault(f => f.FileType == FileType.Image && f.SortOrder == 0)?.FileUrl
                 ?? p.Files.FirstOrDefault(f => f.FileType == FileType.Image)?.FileUrl;

        return new ProductSummaryDto(
            p.Id, p.Title, p.Slug, p.ShortDescription,
            p.Price, p.SalePrice, p.ProductType, p.BillingCycle,
            p.Category?.Name ?? "",
            p.ProductTags.Select(pt => pt.Tag.Name),
            thumb != null ? storage.GetPublicUrl(thumb) : null,
            p.AverageRating, p.TotalSales, p.IsActive, p.IsFeatured, p.CreatedAt
        );
    }

    private ProductDetailDto ToDetail(Product p) {
        var thumb = p.Files.FirstOrDefault(f => f.FileType == FileType.Image && f.SortOrder == 0)?.FileUrl
                 ?? p.Files.FirstOrDefault(f => f.FileType == FileType.Image)?.FileUrl;

        return new ProductDetailDto(
            p.Id, p.Title, p.Slug, p.Description, p.ShortDescription,
            p.Price, p.SalePrice, p.ProductType, p.BillingCycle,
            p.CategoryId, p.Category?.Name ?? "",
            p.ProductTags.Select(pt => pt.Tag.Name),
            p.Files.OrderBy(f => f.SortOrder).Select(f => new ProductFileDto(
                f.Id, f.FileType,
                f.FileType == FileType.SourceCodeArchive ? "" : storage.GetPublicUrl(f.FileUrl),
                f.FileName, f.FileSize, f.SortOrder, f.IsPreview)),
            p.Addons.Where(a => a.IsActive).Select(a => new ProductAddonDto(a.Id, a.Name, a.Description, a.Price, a.IsActive)),
            p.AverageRating, p.TotalSales, p.RequiresLicense,
            p.DemoUrl, p.TechStack, p.IsActive, p.IsFeatured, p.CreatedAt,
            thumb != null ? storage.GetPublicUrl(thumb) : null
        );
    }

    private static string GenerateSlug(string title)
    {
        var slug = title.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("đ", "d")
            .Replace("à", "a").Replace("á", "a").Replace("ả", "a").Replace("ã", "a").Replace("ạ", "a")
            .Replace("ă", "a").Replace("ằ", "a").Replace("ắ", "a").Replace("ẳ", "a").Replace("ẵ", "a").Replace("ặ", "a")
            .Replace("â", "a").Replace("ầ", "a").Replace("ấ", "a").Replace("ẩ", "a").Replace("ẫ", "a").Replace("ậ", "a")
            .Replace("è", "e").Replace("é", "e").Replace("ẻ", "e").Replace("ẽ", "e").Replace("ẹ", "e")
            .Replace("ê", "e").Replace("ề", "e").Replace("ế", "e").Replace("ể", "e").Replace("ễ", "e").Replace("ệ", "e")
            .Replace("ì", "i").Replace("í", "i").Replace("ỉ", "i").Replace("ĩ", "i").Replace("ị", "i")
            .Replace("ò", "o").Replace("ó", "o").Replace("ỏ", "o").Replace("õ", "o").Replace("ọ", "o")
            .Replace("ô", "o").Replace("ồ", "o").Replace("ố", "o").Replace("ổ", "o").Replace("ỗ", "o").Replace("ộ", "o")
            .Replace("ơ", "o").Replace("ờ", "o").Replace("ớ", "o").Replace("ở", "o").Replace("ỡ", "o").Replace("ợ", "o")
            .Replace("ù", "u").Replace("ú", "u").Replace("ủ", "u").Replace("ũ", "u").Replace("ụ", "u")
            .Replace("ư", "u").Replace("ừ", "u").Replace("ứ", "u").Replace("ử", "u").Replace("ữ", "u").Replace("ự", "u")
            .Replace("ỳ", "y").Replace("ý", "y").Replace("ỷ", "y").Replace("ỹ", "y").Replace("ỵ", "y");

        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-").Trim('-');
        return $"{slug}-{Guid.NewGuid().ToString()[..8]}";
    }
}
