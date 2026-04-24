using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.Infrastructure.Persistence.Configurations;

public class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Title).IsRequired().HasMaxLength(500);
        builder.Property(p => p.Slug).IsRequired().HasMaxLength(600);
        builder.Property(p => p.Excerpt).IsRequired().HasMaxLength(1000);

        // Store the rich-text JSON document as JSONB for efficient querying
        builder.Property(p => p.ContentJson)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("{}");

        builder.Property(p => p.CoverImageUrl).HasMaxLength(1000);

        builder.HasIndex(p => p.Slug).IsUnique();
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.PublishedAt);

        // Author
        builder.HasOne(p => p.Author)
            .WithMany()
            .HasForeignKey(p => p.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        // BlogCategory (optional)
        builder.HasOne(p => p.BlogCategory)
            .WithMany(c => c.Posts)
            .HasForeignKey(p => p.BlogCategoryId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);
    }
}
