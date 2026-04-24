using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.DTOs.Blog;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Entities;
using SourceEcommerce.Domain.Enums;
using SourceEcommerce.Domain.Interfaces;
using System.Text.RegularExpressions;

namespace SourceEcommerce.Application.Services;

public class BlogService(IApplicationDbContext db, IStorageService storage)
{
    // Posts

    public async Task<PostListResponse> GetListAsync(PostQueryParams q, bool adminMode = false, CancellationToken ct = default)
    {
        var query = db.Posts
            .Include(p => p.Author)
            .Include(p => p.BlogCategory)
            .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
            .AsNoTracking();

        // Public only sees Published posts
        if (!adminMode)
            query = query.Where(p => p.Status == PostStatus.Published);
        else if (q.Status.HasValue)
            query = query.Where(p => p.Status == q.Status.Value);

        if (!string.IsNullOrWhiteSpace(q.Search))
            query = query.Where(p =>
                EF.Functions.ILike(p.Title, $"%{q.Search}%") ||
                EF.Functions.ILike(p.Excerpt, $"%{q.Search}%"));

        if (q.BlogCategoryId.HasValue)
            query = query.Where(p => p.BlogCategoryId == q.BlogCategoryId.Value);

        if (!string.IsNullOrWhiteSpace(q.TagSlug))
            query = query.Where(p => p.PostTags.Any(pt => pt.Tag.Slug == q.TagSlug));

        if (q.IsFeatured.HasValue)
            query = query.Where(p => p.IsFeatured == q.IsFeatured.Value);

        query = q.SortBy.ToLower() switch
        {
            "title"      => q.SortDesc ? query.OrderByDescending(p => p.Title)     : query.OrderBy(p => p.Title),
            "views"      => q.SortDesc ? query.OrderByDescending(p => p.ViewCount)  : query.OrderBy(p => p.ViewCount),
            "createdat"  => q.SortDesc ? query.OrderByDescending(p => p.CreatedAt)  : query.OrderBy(p => p.CreatedAt),
            _            => q.SortDesc ? query.OrderByDescending(p => p.PublishedAt ?? p.CreatedAt)
                                       : query.OrderBy(p => p.PublishedAt ?? p.CreatedAt)
        };

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((q.Page - 1) * q.PageSize)
            .Take(q.PageSize)
            .ToListAsync(ct);

        return new PostListResponse(items.Select(ToSummary), total, q.Page, q.PageSize);
    }

    public async Task<PostDetailDto?> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var post = await db.Posts
            .Include(p => p.Author)
            .Include(p => p.BlogCategory)
            .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
            .Include(p => p.Media)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Slug == slug && p.Status == PostStatus.Published, ct);

        return post == null ? null : ToDetail(post);
    }

    public async Task<PostDetailDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var post = await db.Posts
            .Include(p => p.Author)
            .Include(p => p.BlogCategory)
            .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
            .Include(p => p.Media)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        return post == null ? null : ToDetail(post);
    }

    public async Task<PostDetailDto> CreateAsync(CreatePostRequest req, Guid authorId, CancellationToken ct = default)
    {
        var post = new Post
        {
            Title          = req.Title,
            Slug           = GenerateSlug(req.Title),
            Excerpt        = req.Excerpt,
            ContentJson    = req.ContentJson,
            Status         = req.Status,
            IsFeatured     = req.IsFeatured,
            AuthorId       = authorId,
            BlogCategoryId = req.BlogCategoryId,
            ReadTimeMinutes = ComputeReadTime(req.ContentJson),
        };

        if (req.Status == PostStatus.Published)
            post.PublishedAt = DateTime.UtcNow;

        if (req.TagIds.Count > 0)
        {
            post.PostTags = req.TagIds.Select(tid => new PostTag
            {
                PostId = post.Id,
                TagId  = tid
            }).ToList();
        }

        db.Posts.Add(post);
        await db.SaveChangesAsync(ct);

        // Move cover image from temp/ to permanent location
        if (!string.IsNullOrWhiteSpace(req.CoverImageUrl) && req.CoverImageUrl.StartsWith("temp/"))
        {
            var fileName = req.CoverImageUrl.Split('/').Last();
            var destKey  = $"blog/{post.Id}/cover/{fileName}";
            await storage.CopyAsync(req.CoverImageUrl, destKey, isPublic: true, ct);

            post.CoverImageUrl = destKey;
            await db.SaveChangesAsync(ct);
        }

        return (await GetByIdAsync(post.Id, ct))!;
    }

    public async Task<PostDetailDto?> UpdateAsync(Guid id, UpdatePostRequest req, CancellationToken ct = default)
    {
        var post = await db.Posts
            .Include(p => p.PostTags)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (post == null) return null;

        if (req.Title is not null)
        {
            post.Title = req.Title;
            post.Slug  = GenerateSlug(req.Title);
        }
        if (req.Excerpt        is not null) post.Excerpt        = req.Excerpt;
        if (req.ContentJson    is not null)
        {
            post.ContentJson    = req.ContentJson;
            post.ReadTimeMinutes = ComputeReadTime(req.ContentJson);
        }
        if (req.BlogCategoryId is not null) post.BlogCategoryId = req.BlogCategoryId;
        if (req.IsFeatured     is not null) post.IsFeatured     = req.IsFeatured.Value;

        // Handle status transitions
        if (req.Status.HasValue && req.Status.Value != post.Status)
        {
            post.Status = req.Status.Value;
            if (req.Status.Value == PostStatus.Published && post.PublishedAt == null)
                post.PublishedAt = DateTime.UtcNow;
        }

        // Handle tags
        if (req.TagIds is not null)
        {
            db.PostTags.RemoveRange(post.PostTags);
            post.PostTags = req.TagIds.Select(tid => new PostTag
            {
                PostId = post.Id,
                TagId  = tid
            }).ToList();
        }

        // Handle cover image replacement
        if (!string.IsNullOrWhiteSpace(req.CoverImageUrl) && req.CoverImageUrl.StartsWith("temp/"))
        {
            if (!string.IsNullOrWhiteSpace(post.CoverImageUrl))
                await storage.DeleteAsync(post.CoverImageUrl, isPublic: true, ct);

            var fileName = req.CoverImageUrl.Split('/').Last();
            var destKey  = $"blog/{post.Id}/cover/{fileName}";
            await storage.CopyAsync(req.CoverImageUrl, destKey, isPublic: true, ct);
            post.CoverImageUrl = destKey;
        }

        await db.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var post = await db.Posts.FindAsync([id], ct);
        if (post == null) return false;

        // Soft-delete: archive instead of hard delete
        post.Status = PostStatus.Archived;
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task IncrementViewAsync(string slug, CancellationToken ct = default)
    {
        await db.Posts
            .Where(p => p.Slug == slug && p.Status == PostStatus.Published)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.ViewCount, p => p.ViewCount + 1), ct);
    }

    // Media

    public async Task<PostMediaDto> UploadMediaAsync(
        Guid postId, Stream fileStream, string fileName, string contentType,
        PostMediaType mediaType, CancellationToken ct = default)
    {
        var post = await db.Posts.FindAsync([postId], ct)
            ?? throw new Exception("Post not found");

        var prefix    = $"blog/{postId}/media/";
        var objectKey = await storage.UploadAsync(fileStream, fileName, contentType, isPublic: true, prefix, ct);

        var sortOrder = await db.PostMedia.CountAsync(m => m.PostId == postId, ct);

        var media = new PostMedia
        {
            PostId    = postId,
            MediaType = mediaType,
            ObjectKey = objectKey,
            FileName  = fileName,
            FileSize  = fileStream.Length,
            MimeType  = contentType,
            SortOrder = sortOrder
        };

        db.PostMedia.Add(media);
        await db.SaveChangesAsync(ct);

        return ToMediaDto(media);
    }

    public async Task<bool> DeleteMediaAsync(Guid postId, Guid mediaId, CancellationToken ct = default)
    {
        var media = await db.PostMedia
            .FirstOrDefaultAsync(m => m.Id == mediaId && m.PostId == postId, ct);

        if (media == null) return false;

        await storage.DeleteAsync(media.ObjectKey, isPublic: true, ct);
        db.PostMedia.Remove(media);
        await db.SaveChangesAsync(ct);
        return true;
    }

    // Blog Categories

    public async Task<IEnumerable<BlogCategoryDto>> GetCategoriesAsync(CancellationToken ct = default)
    {
        var cats = await db.BlogCategories
            .AsNoTracking()
            .Select(c => new
            {
                c.Id, c.Name, c.Slug, c.Description,
                PostCount = c.Posts.Count(p => p.Status == PostStatus.Published)
            })
            .OrderBy(c => c.Name)
            .ToListAsync(ct);

        return cats.Select(c => new BlogCategoryDto(c.Id, c.Name, c.Slug, c.Description, c.PostCount));
    }

    public async Task<BlogCategoryDto> CreateCategoryAsync(BlogCategoryRequest req, CancellationToken ct = default)
    {
        var cat = new BlogCategory
        {
            Name        = req.Name,
            Slug        = GenerateSlug(req.Name),
            Description = req.Description
        };
        db.BlogCategories.Add(cat);
        await db.SaveChangesAsync(ct);

        return new BlogCategoryDto(cat.Id, cat.Name, cat.Slug, cat.Description, 0);
    }

    public async Task<BlogCategoryDto?> UpdateCategoryAsync(Guid id, BlogCategoryRequest req, CancellationToken ct = default)
    {
        var cat = await db.BlogCategories.FindAsync([id], ct);
        if (cat == null) return null;

        cat.Name        = req.Name;
        cat.Slug        = GenerateSlug(req.Name);
        cat.Description = req.Description;
        await db.SaveChangesAsync(ct);

        var postCount = await db.Posts.CountAsync(p => p.BlogCategoryId == id && p.Status == PostStatus.Published, ct);
        return new BlogCategoryDto(cat.Id, cat.Name, cat.Slug, cat.Description, postCount);
    }

    public async Task<bool> DeleteCategoryAsync(Guid id, CancellationToken ct = default)
    {
        var cat = await db.BlogCategories.FindAsync([id], ct);
        if (cat == null) return false;
        db.BlogCategories.Remove(cat);
        await db.SaveChangesAsync(ct);
        return true;
    }

    // Mappers

    private PostSummaryDto ToSummary(Post p) => new(
        p.Id, p.Title, p.Slug, p.Excerpt,
        p.CoverImageUrl != null ? storage.GetPublicUrl(p.CoverImageUrl) : null,
        p.Status,
        p.Author.FullName,
        p.Author.AvatarUrl,
        p.BlogCategory?.Name,
        p.BlogCategory?.Slug,
        p.PostTags.Select(pt => pt.Tag.Name),
        p.ViewCount, p.ReadTimeMinutes, p.IsFeatured,
        p.PublishedAt, p.CreatedAt
    );

    private PostDetailDto ToDetail(Post p) => new(
        p.Id, p.Title, p.Slug, p.Excerpt, p.ContentJson,
        p.CoverImageUrl != null ? storage.GetPublicUrl(p.CoverImageUrl) : null,
        p.Status,
        p.Author.FullName,
        p.Author.AvatarUrl,
        p.BlogCategoryId,
        p.BlogCategory?.Name,
        p.BlogCategory?.Slug,
        p.PostTags.Select(pt => pt.Tag.Name),
        p.Media.OrderBy(m => m.SortOrder).Select(ToMediaDto),
        p.ViewCount, p.ReadTimeMinutes, p.IsFeatured,
        p.PublishedAt, p.CreatedAt, p.UpdatedAt
    );

    private PostMediaDto ToMediaDto(PostMedia m) => new(
        m.Id, m.MediaType,
        storage.GetPublicUrl(m.ObjectKey),
        m.FileName, m.FileSize, m.MimeType, m.SortOrder
    );

    // Utilities

    /// <summary>
    /// Estimate reading time: strip JSON structure, count words, assume 200 wpm.
    /// </summary>
    private static int ComputeReadTime(string contentJson)
    {
        // Extract text nodes from JSON by removing JSON structure characters
        var text      = Regex.Replace(contentJson, "\"type\"\\s*:\\s*\"[^\"]+\"|[{\\[\\]},]|\"[a-zA-Z]+\"\\s*:", " ");
        var words     = text.Split([' ', '\n', '\r', '\t'], StringSplitOptions.RemoveEmptyEntries).Length;
        var minutes   = (int)Math.Ceiling(words / 200.0);
        return Math.Max(1, minutes);
    }

    private static string GenerateSlug(string title)
    {
        var slug = title.ToLowerInvariant()
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
            .Replace("ỳ", "y").Replace("ý", "y").Replace("ỷ", "y").Replace("ỹ", "y").Replace("ỵ", "y")
            .Replace(" ", "-");

        slug = Regex.Replace(slug, @"[^a-z0-9\-]", "");
        slug = Regex.Replace(slug, @"-+", "-").Trim('-');
        return $"{slug}-{Guid.NewGuid().ToString()[..8]}";
    }
}
