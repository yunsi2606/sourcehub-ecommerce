using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Blog post. Content stored as a ProseMirror-compatible JSON document (rich text — Word-like).
/// </summary>
public class Post : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    /// <summary>Short teaser shown in listing cards.</summary>
    public string Excerpt { get; set; } = string.Empty;

    /// <summary>
    /// Full rich-text content stored as a ProseMirror JSON document string.
    /// Supports: paragraphs, headings, lists, tables, blockquotes, code blocks,
    /// inline formatting (bold, italic, underline, color, fontSize, fontFamily, etc.),
    /// embedded images, videos, and file attachments.
    /// </summary>
    public string ContentJson { get; set; } = "{}";

    /// <summary>Cover image object key in R2 (moved from temp/ after creation).</summary>
    public string? CoverImageUrl { get; set; }

    public PostStatus Status { get; set; } = PostStatus.Draft;

    public bool IsFeatured { get; set; } = false;

    /// <summary>Estimated reading time in minutes (computed from content length on save).</summary>
    public int ReadTimeMinutes { get; set; } = 0;

    public int ViewCount { get; set; } = 0;

    /// <summary>Set when Status transitions to Published.</summary>
    public DateTime? PublishedAt { get; set; }

    // FK - Author
    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;

    // FK - BlogCategory (nullable - post may be uncategorised)
    public Guid? BlogCategoryId { get; set; }
    public BlogCategory? BlogCategory { get; set; }

    // Navigation
    public ICollection<PostTag> PostTags { get; set; } = [];
    public ICollection<PostMedia> Media { get; set; } = [];
}
