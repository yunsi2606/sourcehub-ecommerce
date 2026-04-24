using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Application.DTOs.Product;

// Request DTOs

public record CreateProductRequest(
    string Title,
    string Description,
    string ShortDescription,
    decimal Price,
    decimal? SalePrice,
    ProductType ProductType,
    BillingCycle? BillingCycle,
    Guid CategoryId,
    bool RequiresLicense,
    string? DemoUrl,
    string? TechStack,
    List<Guid> TagIds,
    string? ThumbnailUrl
);

public record UpdateProductRequest(
    string? Title,
    string? Description,
    string? ShortDescription,
    decimal? Price,
    decimal? SalePrice,
    bool? IsActive,
    bool? IsFeatured,
    bool? RequiresLicense,
    string? DemoUrl,
    string? TechStack,
    Guid? CategoryId,
    List<Guid>? TagIds,
    string? ThumbnailUrl
);

// Response DTOs

public record ProductFileDto(
    Guid Id,
    FileType FileType,
    string FileUrl,
    string FileName,
    long FileSize,
    int SortOrder,
    bool IsPreview
);

public record ProductAddonDto(
    Guid Id,
    string Name,
    string Description,
    decimal Price,
    bool IsActive
);

public record ProductSummaryDto(
    Guid Id,
    string Title,
    string Slug,
    string ShortDescription,
    decimal Price,
    decimal? SalePrice,
    ProductType ProductType,
    BillingCycle? BillingCycle,
    string CategoryName,
    IEnumerable<string> Tags,
    string? ThumbnailUrl,
    double AverageRating,
    int TotalSales,
    bool IsActive,
    bool IsFeatured,
    DateTime CreatedAt
);

public record ProductDetailDto(
    Guid Id,
    string Title,
    string Slug,
    string Description,
    string ShortDescription,
    decimal Price,
    decimal? SalePrice,
    ProductType ProductType,
    BillingCycle? BillingCycle,
    Guid CategoryId,
    string CategoryName,
    IEnumerable<string> Tags,
    IEnumerable<ProductFileDto> Files,
    IEnumerable<ProductAddonDto> Addons,
    double AverageRating,
    int TotalSales,
    bool RequiresLicense,
    string? DemoUrl,
    string? TechStack,
    bool IsActive,
    bool IsFeatured,
    DateTime CreatedAt,
    string? ThumbnailUrl
);

public record ProductListResponse(
    IEnumerable<ProductSummaryDto> Items,
    int TotalCount,
    int Page,
    int PageSize
);

// Query params

public record ProductQueryParams(
    string? Search,
    Guid? CategoryId,
    string? CategorySlug,        // alternative to CategoryId for public API
    List<Guid>? TagIds,
    string? TagSlug,             // alternative to TagIds for public API (single tag)
    ProductType? ProductType,
    decimal? MinPrice,
    decimal? MaxPrice,
    bool? IsActive,
    bool? IsFeatured,
    string SortBy = "createdAt",
    bool SortDesc = true,
    int Page = 1,
    int PageSize = 12
);
