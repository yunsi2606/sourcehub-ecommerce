using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Domain.Entities;

/// <summary>
/// Application user managed by custom JWT auth.
/// </summary>
public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Password { get; set; }
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; } = UserRole.Customer;
    public bool IsActive { get; set; } = true;

    // OAuth providers
    public string? GoogleId { get; set; } // Google subject ID
    public string? GithubId { get; set; } // GitHub user ID (string form)

    // TOTP 2FA (Google Authenticator)
    public string? TotpSecret { get; set; } // Base32-encoded secret, null = disabled
    public bool TotpEnabled { get; set; } = false;

    // Navigation properties
    public ICollection<Order> Orders { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
    public ICollection<WishlistItem> WishlistItems { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
    public ICollection<Download> Downloads { get; set; } = [];
    public ICollection<Subscription> Subscriptions { get; set; } = [];
}
