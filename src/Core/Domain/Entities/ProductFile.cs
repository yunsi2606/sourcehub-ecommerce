using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// A file asset associated with a product.
/// Images and videos are stored publicly on R2; source code archives are stored privately.
/// </summary>
public class ProductFile : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public FileType FileType { get; set; }

    /// <summary>R2 object URL. Public for Image/Video; private (path only) for SourceCodeArchive.</summary>
    public string FileUrl { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    /// <summary>File size in bytes.</summary>
    public long FileSize { get; set; }

    /// <summary>Display order in gallery.</summary>
    public int SortOrder { get; set; } = 0;

    /// <summary>If true, this file can be previewed without purchasing.</summary>
    public bool IsPreview { get; set; } = false;

    // Navigation properties
    public ICollection<Download> Downloads { get; set; } = [];
}
