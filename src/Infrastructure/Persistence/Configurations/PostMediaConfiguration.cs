using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.Infrastructure.Persistence.Configurations;

public class PostMediaConfiguration : IEntityTypeConfiguration<PostMedia>
{
    public void Configure(EntityTypeBuilder<PostMedia> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.ObjectKey).IsRequired().HasMaxLength(1000);
        builder.Property(m => m.FileName).IsRequired().HasMaxLength(500);
        builder.Property(m => m.MimeType).IsRequired().HasMaxLength(200);

        builder.HasOne(m => m.Post)
            .WithMany(p => p.Media)
            .HasForeignKey(m => m.PostId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
