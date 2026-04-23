using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SourceEcommerce.Application.DTOs.Auth;
using SourceEcommerce.Application.Services;

namespace SourceEcommerce.API.Controllers;

public class AuthController(AuthService authService) : BaseApiController
{
    private const string RefreshTokenCookie = "refresh_token";

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req, CancellationToken ct)
    {
        try
        {
            var result = await authService.RegisterAsync(req, ct);
            SetRefreshCookie(result.RefreshToken);
            return Ok(new { result.AccessToken, result.User });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req, CancellationToken ct)
    {
        try
        {
            var result = await authService.LoginAsync(req, ct);
            SetRefreshCookie(result.RefreshToken);
            return Ok(new { result.AccessToken, result.User });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken ct)
    {
        var token = Request.Cookies[RefreshTokenCookie];
        if (string.IsNullOrEmpty(token))
            return Unauthorized(new { error = "No refresh token." });

        try
        {
            var result = await authService.RefreshAsync(token, ct);
            SetRefreshCookie(result.RefreshToken);
            return Ok(new { result.AccessToken, result.User });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var token = Request.Cookies[RefreshTokenCookie];
        if (!string.IsNullOrEmpty(token))
            await authService.RevokeAsync(token, ct);

        Response.Cookies.Delete(RefreshTokenCookie, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/"
        });
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var id = User.FindFirst("sub")?.Value;
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        return Ok(new { id, email, role });
    }

    // Helpers
    private void SetRefreshCookie(string token)
    {
        Response.Cookies.Append(RefreshTokenCookie, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // Phải là true để đi cùng SameSite=None
            SameSite = SameSiteMode.None, // Cho phép gửi chéo domain/port
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddDays(7),
        });
    }
}
