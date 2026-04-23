namespace SourceEcommerce.Infrastructure.Services;

/// <summary>
/// Strongly-typed configuration bound from appsettings.json "CloudflareR2" section.
/// </summary>
public class R2Options
{
    public const string SectionName = "CloudflareR2";

    public string AccountId { get; set; } = string.Empty;
    public string AccessKeyId { get; set; } = string.Empty;
    public string SecretAccessKey { get; set; } = string.Empty;
    public string PublicBucketName { get; set; } = string.Empty;
    public string PrivateBucketName { get; set; } = string.Empty;
    public string PublicCdnUrl { get; set; } = string.Empty;
    public int PresignedUrlExpirySeconds { get; set; } = 300;
}
