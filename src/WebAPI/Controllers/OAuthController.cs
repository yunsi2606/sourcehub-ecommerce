using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SourceEcommerce.Application.DTOs.Auth;
using SourceEcommerce.Application.Services;

namespace SourceEcommerce.API.Controllers;

/// <summary>
/// OAuth 2.0 endpoints for Google and GitHub login,
/// plus TOTP 2FA (Google Authenticator) setup and verification.
/// </summary>
public class OAuthController(OAuthService oauthService, IConfiguration config) : BaseApiController
{
    private const string RefreshTokenCookie = "refresh_token";

    // Google

    /// <summary>
    /// Step 1 of Google OAuth: redirect user to Google's consent screen.
    /// Frontend calls this URL directly (not via fetch).
    /// </summary>
    [HttpGet("google")]
    public IActionResult GoogleLogin([FromQuery] string? returnUrl = "/")
    {
        var clientId = config["Google:ClientId"];
        if (string.IsNullOrEmpty(clientId)) return BadRequest("Google ClientId is not configured.");

        var redirectUri = BuildCallbackUrl("google");
        var state = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(returnUrl ?? "/"));

        var url = "https://accounts.google.com/o/oauth2/v2/auth" +
            $"?client_id={Uri.EscapeDataString(clientId)}" +
            $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
            "&response_type=code" +
            "&scope=openid%20email%20profile" +
            "&access_type=offline" +
            "&prompt=consent" +
            $"&state={Uri.EscapeDataString(state)}";

        return Redirect(url);
    }

    /// <summary>
    /// Step 2: Google redirects here with an authorization code.
    /// Exchanges code for tokens, upserts the user, then redirects the browser
    /// to the frontend with either a temp TOTP token or full auth info.
    /// </summary>
    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleCallback([FromQuery] string code, [FromQuery] string state, CancellationToken ct)
    {
        try
        {
            var redirectUri = BuildCallbackUrl("google");
            var result = await oauthService.LoginWithGoogleAsync(code, redirectUri, ct);

            var frontendBase = config["FrontendUrl"] ?? "http://localhost:3000";

            if (result.RequiresTotp)
            {
                // Redirect to FE TOTP verification page with a short-lived temp token
                return Redirect($"{frontendBase}/totp?tempToken={Uri.EscapeDataString(result.TempToken!)}");
            }

            // Issue refresh cookie then redirect to FE with access token in query
            SetRefreshCookie(result.AuthResponse!.RefreshToken);
            var returnUrl = DecodeState(state);
            return Redirect($"{frontendBase}/callback?accessToken={Uri.EscapeDataString(result.AuthResponse.AccessToken)}&returnUrl={Uri.EscapeDataString(returnUrl)}");
        }
        catch (Exception ex)
        {
            var frontendBase = config["FrontendUrl"] ?? "http://localhost:3000";
            return Redirect($"{frontendBase}/login?error={Uri.EscapeDataString(ex.Message)}");
        }
    }

    // GitHub

    [HttpGet("github")]
    public IActionResult GitHubLogin([FromQuery] string? returnUrl = "/")
    {
        var clientId = config["GitHub:ClientId"];
        if (string.IsNullOrEmpty(clientId)) return BadRequest("GitHub ClientId is not configured.");

        var state = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(returnUrl ?? "/"));

        var url = "https://github.com/login/oauth/authorize" +
            $"?client_id={Uri.EscapeDataString(clientId)}" +
            "&scope=read:user%20user:email" +
            $"&state={Uri.EscapeDataString(state)}";

        return Redirect(url);
    }

    [HttpGet("github/callback")]
    public async Task<IActionResult> GitHubCallback([FromQuery] string code, [FromQuery] string state, CancellationToken ct)
    {
        try
        {
            var result = await oauthService.LoginWithGithubAsync(code, ct);
            SetRefreshCookie(result.AuthResponse!.RefreshToken);

            var frontendBase = config["FrontendUrl"] ?? "http://localhost:3000";
            var returnUrl = DecodeState(state);
            return Redirect($"{frontendBase}/callback?accessToken={Uri.EscapeDataString(result.AuthResponse.AccessToken)}&returnUrl={Uri.EscapeDataString(returnUrl)}");
        }
        catch (Exception ex)
        {
            var frontendBase = config["FrontendUrl"] ?? "http://localhost:3000";
            return Redirect($"{frontendBase}/login?error={Uri.EscapeDataString(ex.Message)}");
        }
    }

    // TOTP 2FA

    /// <summary>Verify 6-digit OTP from Google Authenticator and issue real JWT.</summary>
    [HttpPost("totp/verify")]
    public async Task<IActionResult> VerifyTotp([FromBody] TotpVerifyRequest req, CancellationToken ct)
    {
        try
        {
            var result = await oauthService.VerifyTotpAsync(req.TempToken, req.Otp, ct);
            SetRefreshCookie(result.RefreshToken);
            return Ok(new { result.AccessToken, result.User });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    /// <summary>Generate a TOTP secret + QR URI for the authenticated user to scan.</summary>
    [HttpPost("totp/setup")]
    [Authorize]
    public async Task<IActionResult> SetupTotp(CancellationToken ct)
    {
        var result = await oauthService.SetupTotpAsync(CurrentUserId, ct);
        return Ok(new { result.Secret, result.QrCodeUri });
    }

    /// <summary>Confirm the first OTP to activate 2FA.</summary>
    [HttpPost("totp/confirm")]
    [Authorize]
    public async Task<IActionResult> ConfirmTotp([FromBody] OtpOnlyRequest req, CancellationToken ct)
    {
        var ok = await oauthService.ConfirmTotpAsync(CurrentUserId, req.Otp, ct);
        return ok ? Ok(new { enabled = true }) : BadRequest(new { error = "Invalid code. Try again." });
    }

    /// <summary>Disable 2FA for the authenticated user.</summary>
    [HttpDelete("totp")]
    [Authorize]
    public async Task<IActionResult> DisableTotp(CancellationToken ct)
    {
        await oauthService.DisableTotpAsync(CurrentUserId, ct);
        return Ok(new { enabled = false });
    }

    // Helpers

    private void SetRefreshCookie(string token)
    {
        var options = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddDays(7),
        };

        // Share cookie across subdomains (e.g. api-sourcehub and sourcehub on same apex domain)
        var frontendUrl = config["FrontendUrl"] ?? "";
        if (frontendUrl.Contains("nhatcuong.io.vn"))
        {
            options.Domain = ".nhatcuong.io.vn";
        }

        Response.Cookies.Append(RefreshTokenCookie, token, options);
    }

    private string BuildCallbackUrl(string provider)
    {
        var backendUrl = config["BackendUrl"];
        if (!string.IsNullOrEmpty(backendUrl))
        {
            return $"{backendUrl.TrimEnd('/')}/api/v1/oauth/{provider}/callback";
        }
        return $"{Request.Scheme}://{Request.Host}/api/v1/oauth/{provider}/callback";
    }

    private static string DecodeState(string state)
    {
        try { return System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(state)); }
        catch { return "/"; }
    }
}
