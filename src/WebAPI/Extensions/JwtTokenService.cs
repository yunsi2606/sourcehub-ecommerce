using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.API.Extensions;

public class JwtTokenService(IConfiguration config) : IJwtTokenService
{
    private readonly string _secret = config["Jwt:Secret"]!;
    private readonly string _issuer = config["Jwt:Issuer"] ?? "source-ecommerce-api";
    private readonly string _audience = config["Jwt:Audience"] ?? "source-ecommerce-web";
    public int AccessTokenMinutes { get; } = int.Parse(config["Jwt:AccessTokenMinutes"] ?? "15");

    public string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(AccessTokenMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
