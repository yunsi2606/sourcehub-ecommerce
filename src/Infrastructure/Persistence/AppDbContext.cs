using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Entities;
using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IApplicationDbContext
{
    // Auth / User
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // Catalog
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductTag> ProductTags => Set<ProductTag>();
    public DbSet<ProductFile> ProductFiles => Set<ProductFile>();
    public DbSet<ProductAddon> ProductAddons => Set<ProductAddon>();

    // Blog
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<PostTag> PostTags => Set<PostTag>();
    public DbSet<PostMedia> PostMedia => Set<PostMedia>();
    public DbSet<BlogCategory> BlogCategories => Set<BlogCategory>();

    // Sales
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderItemAddon> OrderItemAddons => Set<OrderItemAddon>();
    public DbSet<Payment> Payments => Set<Payment>();

    // Fulfillment
    public DbSet<Download> Downloads => Set<Download>();
    public DbSet<LicenseKey> LicenseKeys => Set<LicenseKey>();
    public DbSet<ServiceProject> ServiceProjects => Set<ServiceProject>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<SubscriptionPayment> SubscriptionPayments => Set<SubscriptionPayment>();

    // Engagement
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("sourcehub");
        
        base.OnModelCreating(modelBuilder);

        // Apply all IEntityTypeConfiguration from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Store enums as strings for readability in DB
        modelBuilder.HasPostgresEnum<PlanTier>();
        modelBuilder.HasPostgresEnum<ProductType>();
        modelBuilder.HasPostgresEnum<BillingCycle>();
        modelBuilder.HasPostgresEnum<OrderStatus>();
        modelBuilder.HasPostgresEnum<PaymentStatus>();
        modelBuilder.HasPostgresEnum<PaymentGateway>();
        modelBuilder.HasPostgresEnum<FileType>();
        modelBuilder.HasPostgresEnum<ServiceProjectStatus>();
        modelBuilder.HasPostgresEnum<SubscriptionStatus>();
        modelBuilder.HasPostgresEnum<NotificationType>();
        modelBuilder.HasPostgresEnum<UserRole>();
        modelBuilder.HasPostgresEnum<PostStatus>();
        modelBuilder.HasPostgresEnum<PostMediaType>();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Auto-update UpdatedAt for all modified BaseEntity instances
        var entries = ChangeTracker.Entries<BaseEntity>()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
