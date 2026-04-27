using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using SourceEcommerce.Domain.Interfaces;

namespace SourceEcommerce.Infrastructure.Services;

/// <summary>
/// Cloudflare R2 implementation of IStorageService using the AWS S3-compatible SDK.
/// R2 endpoint format: https://{accountId}.r2.cloudflarestorage.com
/// </summary>
public class R2StorageService : IStorageService, IDisposable
{
    private readonly IAmazonS3 _s3Client;
    private readonly R2Options _options;

    public R2StorageService(IOptions<R2Options> options)
    {
        _options = options.Value;

        var credentials = new BasicAWSCredentials(_options.AccessKeyId, _options.SecretAccessKey);
        var config = new AmazonS3Config
        {
            ServiceURL = $"https://{_options.AccountId}.r2.cloudflarestorage.com",
            ForcePathStyle = true, // Required for R2
            SignatureVersion = "4",
            AuthenticationRegion = "auto"
        };

        _s3Client = new AmazonS3Client(credentials, config);
    }

    /// <inheritdoc />
    public async Task<string> GetPresignedDownloadUrlAsync(
        string objectKey,
        int expirySeconds = 300,
        CancellationToken ct = default)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _options.PrivateBucketName,
            Key = objectKey,
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.AddSeconds(expirySeconds)
        };

        // GetPreSignedURL is synchronous in AWS SDK v3
        return await Task.FromResult(_s3Client.GetPreSignedURL(request));
    }

    /// <inheritdoc />
    public async Task<string> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        bool isPublic,
        string? prefix = null,
        CancellationToken ct = default)
    {
        var bucketName = isPublic ? _options.PublicBucketName : _options.PrivateBucketName;
        var prefixStr = string.IsNullOrWhiteSpace(prefix) ? $"{DateTime.UtcNow:yyyy/MM/dd}/" : prefix;
        var objectKey = $"{prefixStr}{Guid.NewGuid()}_{SanitizeFileName(fileName)}";

        var request = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = objectKey,
            InputStream = fileStream,
            ContentType = contentType,
            DisablePayloadSigning = true
            // R2 uses pre-signed URLs for private files, no ACL needed
        };

        await _s3Client.PutObjectAsync(request, ct);
        return objectKey;
    }

    /// <inheritdoc />
    public async Task DeleteAsync(string objectKey, bool isPublic, CancellationToken ct = default)
    {
        var bucketName = isPublic ? _options.PublicBucketName : _options.PrivateBucketName;
        await _s3Client.DeleteObjectAsync(bucketName, objectKey, ct);
    }

    /// <inheritdoc />
    public async Task CopyAsync(string sourceObjectKey, string destinationObjectKey, bool isPublic, CancellationToken ct = default)
    {
        var bucketName = isPublic ? _options.PublicBucketName : _options.PrivateBucketName;
        
        // Perform the copy manually via GetObject → PutObject.
        var getResponse = await _s3Client.GetObjectAsync(bucketName, sourceObjectKey, ct);
        var memoryStream = new MemoryStream();
        await getResponse.ResponseStream.CopyToAsync(memoryStream, ct);
        memoryStream.Position = 0;

        await _s3Client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = bucketName,
            Key = destinationObjectKey,
            InputStream = memoryStream,
            ContentType = getResponse.Headers.ContentType,
            DisablePayloadSigning = true
        }, ct);
    }

    /// <inheritdoc />
    public string GetPublicUrl(string objectKey)
    {
        // objectKey from DB may already be a full CDN URL (legacy) or just the key
        if (objectKey.StartsWith("http")) return objectKey;
        return $"{_options.PublicCdnUrl.TrimEnd('/')}/{objectKey.TrimStart('/')}";
    }

    private static string SanitizeFileName(string fileName)
    {
        return string.Join("_", fileName.Split(Path.GetInvalidFileNameChars()));
    }

    public void Dispose() => _s3Client.Dispose();
}
