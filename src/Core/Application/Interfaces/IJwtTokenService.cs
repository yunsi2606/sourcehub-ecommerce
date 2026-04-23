using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    int AccessTokenMinutes { get; }
}
