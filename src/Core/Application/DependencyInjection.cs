using Microsoft.Extensions.DependencyInjection;
using SourceEcommerce.Application.Services;

namespace SourceEcommerce.Application;

/// <summary>
/// Application layer DI registration.
/// Business services are registered via Infrastructure.DependencyInjection
/// since they depend on AppDbContext which lives in Infrastructure.
/// This class can be extended for application-only concerns (e.g., validators, mappers).
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<AuthService>();
        services.AddScoped<ProductService>();
        services.AddScoped<OrderService>();
        services.AddScoped<DownloadService>();
        services.AddScoped<PlanService>();
        services.AddScoped<BlogService>();

        return services;
    }
}
