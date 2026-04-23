namespace SourceEcommerce.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public string Token { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; } = false;
    public string? ReplacedByToken { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
