using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Interfaces;
using SourceEcommerce.Infrastructure.Persistence;
using SourceEcommerce.Infrastructure.Repositories;
using SourceEcommerce.Infrastructure.Services;

namespace SourceEcommerce.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql =>
            {
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "public");
                npgsql.EnableRetryOnFailure(3);
            }));

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Cloudflare R2 Storage
        services.Configure<R2Options>(options =>
            configuration.GetSection(R2Options.SectionName).Bind(options));
        services.AddSingleton<IStorageService, R2StorageService>();

        // Stripe
        services.Configure<StripeOptions>(options =>
            configuration.GetSection(StripeOptions.SectionName).Bind(options));
        services.AddScoped<IStripeService, StripeService>();

        // IApplicationDbContext — resolved from the same scoped AppDbContext
        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        return services;
    }
}
