using Microsoft.EntityFrameworkCore;
using OtpNet;
using SourceEcommerce.Application.DTOs.Auth;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Entities;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;

namespace SourceEcommerce.Application.Services;

/// <summary>
/// Handles OAuth login (Google, GitHub) and TOTP 2FA (Google Authenticator).
/// Uses an in-memory pending-TOTP store (consider Redis for multi-instance).
/// </summary>
public class OAuthService(
    IApplicationDbContext db,
    IJwtTokenService jwtTokenService,
    IHttpClientFactory httpClientFactory,
    IConfiguration config)
{
    private readonly int _refreshDays = 7;

    // Temporary store for users who passed OAuth but still need TOTP verification.
    // key = tempToken, value = (userId, expiresAt)
    private static readonly Dictionary<string, (Guid UserId, DateTime ExpiresAt)> _pendingTotp = new();
    private static readonly object _lock = new();

    // Google OAuth

    /// <summary>
    /// Exchange the Google authorization code for an ID token, upsert user, and
    /// return either a full auth response (no 2FA) or a pending-TOTP challenge.
    /// </summary>
    public async Task<OAuthResult> LoginWithGoogleAsync(
        string code, string redirectUri, CancellationToken ct)
    {
        var tokenData = await ExchangeGoogleCodeAsync(code, redirectUri, ct);
        var payload = DecodeJwtPayload(tokenData.IdToken);

        var googleId = payload.GetProperty("sub").GetString()!;
        var email = payload.GetProperty("email").GetString()!.ToLower();
        var name = payload.TryGetProperty("name", out var n) ? n.GetString() ?? email : email;
        var avatar = payload.TryGetProperty("picture", out var p) ? p.GetString() : null;

        var user = await db.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId || u.Email == email, ct);
        if (user == null)
        {
            user = new User { Email = email, FullName = name, AvatarUrl = avatar, GoogleId = googleId };
            db.Users.Add(user);
        }
        else
        {
            user.GoogleId = googleId;
            if (avatar != null && user.AvatarUrl == null) user.AvatarUrl = avatar;
        }
        await db.SaveChangesAsync(ct);

        // If TOTP is enabled → issue a short-lived temp token and ask FE for OTP
        if (user.TotpEnabled)
        {
            var tempToken = IssueTempTotpToken(user.Id);
            return new OAuthResult { RequiresTotp = true, TempToken = tempToken };
        }

        return new OAuthResult { AuthResponse = await IssueTokensAsync(user, ct) };
    }

    // GitHub OAuth

    public async Task<OAuthResult> LoginWithGithubAsync(string code, CancellationToken ct)
    {
        var accessToken = await ExchangeGithubCodeAsync(code, ct);
        var (githubId, email, name, avatar) = await FetchGithubProfileAsync(accessToken, ct);

        var user = await db.Users.FirstOrDefaultAsync(
            u => u.GithubId == githubId || (email != null && u.Email == email), ct);

        if (user == null)
        {
            user = new User
            {
                Email = email ?? $"{githubId}@github.oauth",
                FullName = name,
                AvatarUrl = avatar,
                GithubId = githubId
            };
            db.Users.Add(user);
        }
        else
        {
            user.GithubId = githubId;
            if (avatar != null && user.AvatarUrl == null) user.AvatarUrl = avatar;
        }
        await db.SaveChangesAsync(ct);

        return new OAuthResult { AuthResponse = await IssueTokensAsync(user, ct) };
    }

    // TOTP 2FA

    /// <summary>Verify the 6-digit OTP and issue real tokens if correct.</summary>
    public async Task<AuthResponse> VerifyTotpAsync(string tempToken, string otp, CancellationToken ct)
    {
        Guid userId;
        lock (_lock)
        {
            if (!_pendingTotp.TryGetValue(tempToken, out var pending))
                throw new UnauthorizedAccessException("Invalid or expired session.");

            if (pending.ExpiresAt < DateTime.UtcNow)
            {
                _pendingTotp.Remove(tempToken);
                throw new UnauthorizedAccessException("OTP session expired. Please log in again.");
            }

            userId = pending.UserId;
            _pendingTotp.Remove(tempToken);
        }

        var user = await db.Users.FindAsync([userId], ct)
            ?? throw new UnauthorizedAccessException("User not found.");

        if (!user.TotpEnabled || string.IsNullOrEmpty(user.TotpSecret))
            throw new InvalidOperationException("TOTP is not enabled for this account.");

        var secretBytes = Base32Encoding.ToBytes(user.TotpSecret);
        var totp = new Totp(secretBytes);

        // Allow 1 step tolerance (30s window * 2 = 60s grace)
        if (!totp.VerifyTotp(otp.Trim(), out _, new VerificationWindow(1, 1)))
            throw new UnauthorizedAccessException("Invalid verification code.");

        return await IssueTokensAsync(user, ct);
    }

    /// <summary>Setup TOTP for a user: generates a new secret and returns QR code URI.</summary>
    public async Task<TotpSetupResult> SetupTotpAsync(Guid userId, CancellationToken ct)
    {
        var user = await db.Users.FindAsync([userId], ct)
            ?? throw new InvalidOperationException("User not found.");

        var secretBytes = KeyGeneration.GenerateRandomKey(20);
        var secret = Base32Encoding.ToString(secretBytes);
        var uri = $"otpauth://totp/SourceHub:{Uri.EscapeDataString(user.Email)}?secret={secret}&issuer=SourceHub&algorithm=SHA1&digits=6&period=30";

        // Store temp secret — enabled after first successful verify
        user.TotpSecret = secret;
        user.TotpEnabled = false; // still pending confirmation
        await db.SaveChangesAsync(ct);

        return new TotpSetupResult(secret, uri);
    }

    /// <summary>Confirm and activate TOTP after user scans QR and enters first OTP.</summary>
    public async Task<bool> ConfirmTotpAsync(Guid userId, string otp, CancellationToken ct)
    {
        var user = await db.Users.FindAsync([userId], ct)
            ?? throw new InvalidOperationException("User not found.");

        if (string.IsNullOrEmpty(user.TotpSecret))
            throw new InvalidOperationException("Run SetupTotp first.");

        var secretBytes = Base32Encoding.ToBytes(user.TotpSecret);
        var totp = new Totp(secretBytes);

        if (!totp.VerifyTotp(otp.Trim(), out _, new VerificationWindow(1, 1)))
            return false;

        user.TotpEnabled = true;
        await db.SaveChangesAsync(ct);
        return true;
    }

    /// <summary>Disable TOTP for the user.</summary>
    public async Task DisableTotpAsync(Guid userId, CancellationToken ct)
    {
        var user = await db.Users.FindAsync([userId], ct)
            ?? throw new InvalidOperationException("User not found.");

        user.TotpSecret = null;
        user.TotpEnabled = false;
        await db.SaveChangesAsync(ct);
    }

    // Private helpers

    private string IssueTempTotpToken(Guid userId)
    {
        var token = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
        lock (_lock)
        {
            _pendingTotp[token] = (userId, DateTime.UtcNow.AddMinutes(5));
        }
        return token;
    }

    private async Task<AuthResponse> IssueTokensAsync(User user, CancellationToken ct)
    {
        var accessToken = jwtTokenService.GenerateAccessToken(user);
        var refreshToken = await SaveRefreshTokenAsync(user.Id, ct);
        var expires = DateTime.UtcNow.AddMinutes(jwtTokenService.AccessTokenMinutes);
        var dto = new UserProfileDto(user.Id, user.FullName, user.Email, user.AvatarUrl, user.Role.ToString(), user.TotpEnabled);
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

    // Google token exchange

    private async Task<(string IdToken, string AccessToken)> ExchangeGoogleCodeAsync(
        string code, string redirectUri, CancellationToken ct)
    {
        var clientId = config["Google:ClientId"];
        var clientSecret = config["Google:ClientSecret"];

        if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            throw new InvalidOperationException("Google OAuth is not properly configured.");

        var http = httpClientFactory.CreateClient();
        var response = await http.PostAsync("https://oauth2.googleapis.com/token",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["code"] = code,
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["redirect_uri"] = redirectUri,
                ["grant_type"] = "authorization_code"
            }), ct);

        response.EnsureSuccessStatusCode();
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(ct)).RootElement;
        return (json.GetProperty("id_token").GetString()!, json.GetProperty("access_token").GetString()!);
    }

    private static JsonElement DecodeJwtPayload(string idToken)
    {
        var parts = idToken.Split('.');
        var payload = parts[1];
        var padded = payload.Length % 4 == 0 ? payload : payload + new string('=', 4 - payload.Length % 4);
        var bytes = Convert.FromBase64String(padded.Replace('-', '+').Replace('_', '/'));
        return JsonDocument.Parse(bytes).RootElement;
    }

    // GitHub token exchange

    private async Task<string> ExchangeGithubCodeAsync(string code, CancellationToken ct)
    {
        var clientId = config["GitHub:ClientId"];
        var clientSecret = config["GitHub:ClientSecret"];

        if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            throw new InvalidOperationException("GitHub OAuth is not properly configured.");

        var http = httpClientFactory.CreateClient();
        http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        var response = await http.PostAsJsonAsync("https://github.com/login/oauth/access_token", new
        {
            client_id = clientId,
            client_secret = clientSecret,
            code
        }, ct);

        response.EnsureSuccessStatusCode();
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(ct)).RootElement;
        return json.GetProperty("access_token").GetString()!;
    }

    private async Task<(string Id, string? Email, string Name, string? Avatar)> FetchGithubProfileAsync(
        string accessToken, CancellationToken ct)
    {
        var http = httpClientFactory.CreateClient();
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        http.DefaultRequestHeaders.UserAgent.ParseAdd("SourceHub/1.0");
        http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var profileRes = await http.GetAsync("https://api.github.com/user", ct);
        profileRes.EnsureSuccessStatusCode();
        var profile = JsonDocument.Parse(await profileRes.Content.ReadAsStringAsync(ct)).RootElement;

        var id = profile.GetProperty("id").GetInt64().ToString();
        var name = profile.TryGetProperty("name", out var n) && n.GetString() != null ? n.GetString()! : profile.GetProperty("login").GetString()!;
        var avatar = profile.TryGetProperty("avatar_url", out var a) ? a.GetString() : null;

        // GitHub may not expose email publicly — fetch from /user/emails
        string? email = null;
        if (profile.TryGetProperty("email", out var e) && e.GetString() != null)
        {
            email = e.GetString()!.ToLower();
        }
        else
        {
            var emailsRes = await http.GetAsync("https://api.github.com/user/emails", ct);
            if (emailsRes.IsSuccessStatusCode)
            {
                var emails = JsonDocument.Parse(await emailsRes.Content.ReadAsStringAsync(ct)).RootElement;
                foreach (var entry in emails.EnumerateArray())
                {
                    if (entry.TryGetProperty("primary", out var primary) && primary.GetBoolean() &&
                        entry.TryGetProperty("email", out var em))
                    {
                        email = em.GetString()?.ToLower();
                        break;
                    }
                }
            }
        }

        return (id, email, name, avatar);
    }
}
