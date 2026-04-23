namespace SourceEcommerce.Application.DTOs.Auth;

public record RegisterRequest(string FullName, string Email, string Password);

public record LoginRequest(string Email, string Password);

public record RefreshTokenRequest(string RefreshToken);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserProfileDto User
    );

public record UserProfileDto(
    Guid Id,
    string FullName,
    string Email,
    string? AvatarUrl,
    string Role
    );

public record UpdateProfileRequest(
    string? FullName,
    string? AvatarUrl
    );

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
    );
