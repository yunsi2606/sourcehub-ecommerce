using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.Infrastructure.Persistence.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.HasKey(oi => oi.Id);

        builder.Property(oi => oi.PriceAtPurchase).HasColumnType("numeric(18,2)");

        builder.HasOne(oi => oi.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(oi => oi.Product)
            .WithMany(p => p.OrderItems)
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // 1-to-1 relationships
        builder.HasOne(oi => oi.LicenseKey)
            .WithOne(lk => lk.OrderItem)
            .HasForeignKey<LicenseKey>(lk => lk.OrderItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(oi => oi.ServiceProject)
            .WithOne(sp => sp.OrderItem)
            .HasForeignKey<ServiceProject>(sp => sp.OrderItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(oi => oi.Subscription)
            .WithOne(s => s.OrderItem)
            .HasForeignKey<Subscription>(s => s.OrderItemId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(oi => oi.Review)
            .WithOne(r => r.OrderItem)
            .HasForeignKey<Review>(r => r.OrderItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
