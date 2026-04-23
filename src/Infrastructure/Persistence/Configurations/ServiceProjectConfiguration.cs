using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.Infrastructure.Persistence.Configurations;

public class ServiceProjectConfiguration : IEntityTypeConfiguration<ServiceProject>
{
    public void Configure(EntityTypeBuilder<ServiceProject> builder)
    {
        builder.HasKey(sp => sp.Id);

        builder.HasIndex(sp => sp.Status);

        // Relationship from StandaloneService OrderItem
        builder.HasOne(sp => sp.OrderItem)
            .WithOne(oi => oi.ServiceProject)
            .HasForeignKey<ServiceProject>(sp => sp.OrderItemId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // Relationship from Add-on OrderItemAddon
        builder.HasOne(sp => sp.OrderItemAddon)
            .WithOne(oia => oia.ServiceProject)
            .HasForeignKey<ServiceProject>(sp => sp.OrderItemAddonId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);
    }
}
