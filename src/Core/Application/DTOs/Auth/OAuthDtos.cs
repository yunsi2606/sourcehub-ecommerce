namespace SourceEcommerce.Application.DTOs.Auth;

// ─── OAuth login result ───────────────────────────────────────────────────────

/// <summary>
/// Returned by OAuthService after a provider callback.
/// Either a full AuthResponse (login complete) or a TOTP challenge (2FA required).
/// </summary>
public record OAuthResult
{
    public bool RequiresTotp { get; init; }

    /// <summary>Short-lived token (5 min) used to exchange for real JWT after TOTP verify.</summary>
    public string? TempToken { get; init; }

    public AuthResponse? AuthResponse { get; init; }
}

// ─── TOTP setup ──────────────────────────────────────────────────────────────

public record TotpSetupResult(string Secret, string QrCodeUri);

// ─── TOTP request bodies ─────────────────────────────────────────────────────

public record TotpVerifyRequest(string TempToken, string Otp);

public record OtpOnlyRequest(string Otp);
