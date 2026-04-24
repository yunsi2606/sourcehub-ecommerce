using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// A media asset (image, video, or file) that belongs to a blog post.
/// These are tracked so they can be deleted from R2 when the post is removed.
/// </summary>
public class PostMedia : BaseEntity
{
    public Guid PostId { get; set; }
    public Post Post { get; set; } = null!;

    public PostMediaType MediaType { get; set; }

    /// <summary>R2 object key (not a full URL). Use IStorageService.GetPublicUrl to build URL.</summary>
    public string ObjectKey { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string MimeType { get; set; } = string.Empty;

    /// <summary>Display/sort order within the post's media library.</summary>
    public int SortOrder { get; set; } = 0;
}
