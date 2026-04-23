using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.Interfaces;

namespace SourceEcommerce.API.Extensions;

/// <summary>
/// Middleware that ensures a Supabase-authenticated user has a matching
/// row in our public.Users table. Creates one on first login (first request).
/// Must run AFTER UseAuthentication().
/// </summary>
public class UserSyncMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var subClaim = context.User.FindFirst("sub")?.Value;
            if (Guid.TryParse(subClaim, out var userId))
            {
                var db = context.RequestServices.GetRequiredService<IApplicationDbContext>();

                var userExists = await db.Users.AnyAsync(u => u.Id == userId);
                if (!userExists)
                {
                    var email = context.User.FindFirst("email")?.Value ?? "";
                    var fullName = context.User.FindFirst("name")?.Value
                               ?? context.User.FindFirst("full_name")?.Value
                               ?? email.Split('@')[0];

                    db.Users.Add(new Domain.Entities.User
                    {
                        Id = userId,
                        Email = email,
                        FullName = fullName,
                        Role = Domain.Enums.UserRole.Customer,
                    });

                    try { await db.SaveChangesAsync(); }
                    catch { /* Race condition — another request already created the user */ }
                }
            }
        }

        await next(context);
    }
}

public static class OpenApiExtensions
{
    /// <summary>
    /// Adds OpenAPI document using .NET 10 built-in Microsoft.AspNetCore.OpenApi.
    /// Access the spec at: /openapi/v1.json
    /// </summary>
    public static IServiceCollection AddOpenApiWithAuth(this IServiceCollection services)
    {
        services.AddOpenApi("v1", options =>
        {
            options.AddDocumentTransformer((document, context, cancellationToken) =>
            {
                document.Info = new()
                {
                    Title = "Source E-Commerce API",
                    Version = "v1",
                    Description = "API for selling source code and IT services"
                };
                return Task.CompletedTask;
            });
        });

        return services;
    }
}
