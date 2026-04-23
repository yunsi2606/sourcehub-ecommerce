using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.Infrastructure.Persistence.Configurations;

public class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Slug).IsRequired().HasMaxLength(150);
        builder.Property(p => p.Description).HasMaxLength(500);
        
        builder.Property(p => p.MonthlyPrice).HasColumnType("numeric(18,2)");
        builder.Property(p => p.YearlyPrice).HasColumnType("numeric(18,2)");
        
        builder.HasIndex(p => p.Slug).IsUnique();
        builder.HasIndex(p => p.Tier);
        builder.HasIndex(p => p.IsActive);
    }
}
