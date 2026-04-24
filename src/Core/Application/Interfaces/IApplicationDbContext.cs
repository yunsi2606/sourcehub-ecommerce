using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.Application.Interfaces;

public interface IApplicationDbContext
{
    // Auth / User
    DbSet<User> Users { get; }
    DbSet<RefreshToken> RefreshTokens { get; }

    // Catalog
    DbSet<Category> Categories { get; }
    DbSet<Tag> Tags { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductTag> ProductTags { get; }
    DbSet<ProductFile> ProductFiles { get; }
    DbSet<ProductAddon> ProductAddons { get; }

    // Blog
    DbSet<Post> Posts { get; }
    DbSet<PostTag> PostTags { get; }
    DbSet<PostMedia> PostMedia { get; }
    DbSet<BlogCategory> BlogCategories { get; }

    // Sales
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<OrderItemAddon> OrderItemAddons { get; }
    DbSet<Payment> Payments { get; }

    // Fulfillment
    DbSet<Download> Downloads { get; }
    DbSet<LicenseKey> LicenseKeys { get; }
    DbSet<ServiceProject> ServiceProjects { get; }
    DbSet<Subscription> Subscriptions { get; }
    DbSet<SubscriptionPayment> SubscriptionPayments { get; }
    DbSet<Plan> Plans { get; }

    // Engagement
    DbSet<Review> Reviews { get; }
    DbSet<WishlistItem> WishlistItems { get; }
    DbSet<Notification> Notifications { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
