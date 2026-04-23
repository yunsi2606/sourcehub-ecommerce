using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Title).IsRequired().HasMaxLength(300);
        builder.Property(p => p.Slug).IsRequired().HasMaxLength(350);
        builder.Property(p => p.ShortDescription).HasMaxLength(500);
        builder.Property(p => p.Price).HasColumnType("numeric(18,2)");
        builder.Property(p => p.SalePrice).HasColumnType("numeric(18,2)");
        builder.Property(p => p.DemoUrl).HasMaxLength(500);
        builder.Property(p => p.TechStack).HasMaxLength(500);

        builder.HasIndex(p => p.Slug).IsUnique();
        builder.HasIndex(p => p.CategoryId);
        builder.HasIndex(p => p.ProductType);
        builder.HasIndex(p => p.IsActive);
        builder.HasIndex(p => p.IsFeatured);

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
