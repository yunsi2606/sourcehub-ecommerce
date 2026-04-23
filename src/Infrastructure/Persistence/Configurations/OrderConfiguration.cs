using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.SubTotal).HasColumnType("numeric(18,2)");
        builder.Property(o => o.DiscountAmount).HasColumnType("numeric(18,2)");
        builder.Property(o => o.TotalAmount).HasColumnType("numeric(18,2)");
        builder.Property(o => o.Notes).HasMaxLength(1000);

        builder.HasIndex(o => o.UserId);
        builder.HasIndex(o => o.Status);
        builder.HasIndex(o => o.CreatedAt);

        builder.HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
