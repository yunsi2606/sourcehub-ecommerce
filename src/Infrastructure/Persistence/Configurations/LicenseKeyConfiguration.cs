using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.Infrastructure.Persistence.Configurations;

public class LicenseKeyConfiguration : IEntityTypeConfiguration<LicenseKey>
{
    public void Configure(EntityTypeBuilder<LicenseKey> builder)
    {
        builder.HasKey(lk => lk.Id);
        builder.Property(lk => lk.KeyString).IsRequired().HasMaxLength(200);
        builder.HasIndex(lk => lk.KeyString).IsUnique();
        builder.HasIndex(lk => lk.OrderItemId).IsUnique(); // 1 OrderItem → 1 LicenseKey
    }
}
