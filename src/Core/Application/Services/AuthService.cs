using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.DTOs.Auth;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Entities;
using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Application.Services;

/// <summary>
/// Handles password hashing, token storage and rotation.
/// JWT string generation is delegated to IJwtTokenService (implemented in WebAPI layer).
/// </summary>
public class AuthService(IApplicationDbContext db, IJwtTokenService jwtTokenService)
{
    private readonly int _refreshDays = 7;

    public async Task<AuthResponse> RegisterAsync(RegisterRequest req, CancellationToken ct)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email.ToLower(), ct))
            throw new InvalidOperationException("Email already registered.");

        var user = new User
        {
            Email = req.Email.ToLower(),
            FullName = req.FullName,
            Password = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = UserRole.Customer,
        };

        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
        return await IssueTokensAsync(user, ct);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest req, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email.ToLower(), ct)
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        if (!BCrypt.Net.BCrypt.Verify(req.Password, user.Password))
            throw new UnauthorizedAccessException("Invalid credentials.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is disabled.");

        return await IssueTokensAsync(user, ct);
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct)
    {
        var stored = await db.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == refreshToken, ct)
            ?? throw new UnauthorizedAccessException("Invalid refresh token.");

        if (stored.IsRevoked || stored.ExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Refresh token expired or revoked.");

        stored.IsRevoked = true;
        var response = await IssueTokensAsync(stored.User, ct);
        stored.ReplacedByToken = response.RefreshToken;
        await db.SaveChangesAsync(ct);
        return response;
    }

    public async Task RevokeAsync(string refreshToken, CancellationToken ct)
    {
        var stored = await db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == refreshToken, ct);
        if (stored is null) return;
        stored.IsRevoked = true;
        await db.SaveChangesAsync(ct);
    }

    // Private helpers
    private async Task<AuthResponse> IssueTokensAsync(User user, CancellationToken ct)
    {
        var accessToken = jwtTokenService.GenerateAccessToken(user);
        var refreshToken = await SaveRefreshTokenAsync(user.Id, ct);
        var expires = DateTime.UtcNow.AddMinutes(jwtTokenService.AccessTokenMinutes);
        var dto = new UserProfileDto(user.Id, user.FullName, user.Email, user.AvatarUrl, user.Role.ToString());
        return new AuthResponse(accessToken, refreshToken, expires, dto);
    }

    private async Task<string> SaveRefreshTokenAsync(Guid userId, CancellationToken ct)
    {
        var token = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(64));
        db.RefreshTokens.Add(new RefreshToken
        {
            Token = token,
            UserId = userId,
            ExpiresAt = DateTime.UtcNow.AddDays(_refreshDays),
        });
        await db.SaveChangesAsync(ct);
        return token;
    }
}
