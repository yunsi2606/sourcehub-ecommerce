using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Application.DTOs.Blog;

// Request DTOs

public record CreatePostRequest(
    string Title,
    string Excerpt,
    string ContentJson,
    string? CoverImageUrl,
    Guid? BlogCategoryId,
    List<Guid> TagIds,
    PostStatus Status,
    bool IsFeatured
);

public record UpdatePostRequest(
    string? Title,
    string? Excerpt,
    string? ContentJson,
    string? CoverImageUrl,
    Guid? BlogCategoryId,
    List<Guid>? TagIds,
    PostStatus? Status,
    bool? IsFeatured
);

public record BlogCategoryRequest(
    string Name,
    string? Description
);

public record PostQueryParams(
    string? Search,
    Guid? BlogCategoryId,
    string? TagSlug,
    PostStatus? Status,
    bool? IsFeatured,
    string SortBy = "publishedAt",
    bool SortDesc = true,
    int Page = 1,
    int PageSize = 10
);

// ── Response DTOs ─────────────────────────────────────────────────────────────

public record BlogCategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    int PostCount
);

public record PostMediaDto(
    Guid Id,
    PostMediaType MediaType,
    string Url,
    string FileName,
    long FileSize,
    string MimeType,
    int SortOrder
);

public record PostSummaryDto(
    Guid Id,
    string Title,
    string Slug,
    string Excerpt,
    string? CoverImageUrl,
    PostStatus Status,
    string AuthorName,
    string? AuthorAvatarUrl,
    string? CategoryName,
    string? CategorySlug,
    IEnumerable<string> Tags,
    int ViewCount,
    int ReadTimeMinutes,
    bool IsFeatured,
    DateTime? PublishedAt,
    DateTime CreatedAt
);

public record PostDetailDto(
    Guid Id,
    string Title,
    string Slug,
    string Excerpt,
    string ContentJson,
    string? CoverImageUrl,
    PostStatus Status,
    string AuthorName,
    string? AuthorAvatarUrl,
    Guid? BlogCategoryId,
    string? CategoryName,
    string? CategorySlug,
    IEnumerable<string> Tags,
    IEnumerable<PostMediaDto> Media,
    int ViewCount,
    int ReadTimeMinutes,
    bool IsFeatured,
    DateTime? PublishedAt,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record PostListResponse(
    IEnumerable<PostSummaryDto> Items,
    int TotalCount,
    int Page,
    int PageSize
);
