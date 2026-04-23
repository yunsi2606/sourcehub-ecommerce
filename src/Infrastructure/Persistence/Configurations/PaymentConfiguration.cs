using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Amount).HasColumnType("numeric(18,2)");
        builder.Property(p => p.TransactionId).HasMaxLength(200);
        // Metadata stored as JSONB column in PostgreSQL
        builder.Property(p => p.Metadata).HasColumnType("jsonb");

        builder.HasIndex(p => p.OrderId);
        builder.HasIndex(p => p.TransactionId);
        builder.HasIndex(p => p.Status);

        builder.HasOne(p => p.Order)
            .WithMany(o => o.Payments)
            .HasForeignKey(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
