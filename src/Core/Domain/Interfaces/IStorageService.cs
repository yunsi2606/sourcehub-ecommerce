namespace SourceEcommerce.Domain.Interfaces;

/// <summary>
/// Abstraction over Cloudflare R2 (S3-compatible) object storage.
/// </summary>
public interface IStorageService
{
    /// <summary>Generate a pre-signed URL for a private file (short TTL, e.g. 5 minutes).</summary>
    Task<string> GetPresignedDownloadUrlAsync(string objectKey, int expirySeconds = 300, CancellationToken ct = default);

    /// <summary>Upload a file to the specified bucket and return the object key. An optional prefix can be provided (e.g. "temp/").</summary>
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, bool isPublic, string? prefix = null, CancellationToken ct = default);

    /// <summary>Delete an object from storage.</summary>
    Task DeleteAsync(string objectKey, bool isPublic, CancellationToken ct = default);

    /// <summary>Copy an object within the same bucket.</summary>
    Task CopyAsync(string sourceObjectKey, string destinationObjectKey, bool isPublic, CancellationToken ct = default);

    /// <summary>Build the full public CDN URL for a public asset.</summary>
    string GetPublicUrl(string objectKey);
}
