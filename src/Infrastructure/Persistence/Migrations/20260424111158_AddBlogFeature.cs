using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SourceEcommerce.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBlogFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "sourcehub");

            migrationBuilder.RenameTable(
                name: "WishlistItems",
                newName: "WishlistItems",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "Users",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "Tags",
                newName: "Tags",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "Subscriptions",
                newName: "Subscriptions",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "SubscriptionPayments",
                newName: "SubscriptionPayments",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "ServiceProjects",
                newName: "ServiceProjects",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "Reviews",
                newName: "Reviews",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "RefreshTokens",
                newName: "RefreshTokens",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "ProductTags",
                newName: "ProductTags",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "Products",
                newName: "Products",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "ProductFiles",
                newName: "ProductFiles",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "ProductAddons",
                newName: "ProductAddons",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "Plans",
                newName: "Plans",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "Payments",
                newName: "Payments",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "Orders",
                newName: "Orders",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "OrderItems",
                newName: "OrderItems",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "OrderItemAddons",
                newName: "OrderItemAddons",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "Notifications",
                newName: "Notifications",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "LicenseKeys",
                newName: "LicenseKeys",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "Downloads",
                newName: "Downloads",
                newSchema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "Categories",
                newName: "Categories",
                newSchema: "sourcehub");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:billing_cycle", "one_time,monthly,yearly")
                .Annotation("Npgsql:Enum:file_type", "image,video,source_code_archive")
                .Annotation("Npgsql:Enum:notification_type", "order_confirmed,download_ready,service_update,subscription_renewed,system")
                .Annotation("Npgsql:Enum:order_status", "pending,paid,failed,refunded,cancelled")
                .Annotation("Npgsql:Enum:payment_gateway", "vn_pay,momo,stripe,bank_transfer")
                .Annotation("Npgsql:Enum:payment_status", "pending,success,failed")
                .Annotation("Npgsql:Enum:plan_tier", "free,hobby,pro,enterprise")
                .Annotation("Npgsql:Enum:post_media_type", "image,video,file")
                .Annotation("Npgsql:Enum:post_status", "draft,published,archived")
                .Annotation("Npgsql:Enum:product_type", "source_code,standalone_service")
                .Annotation("Npgsql:Enum:service_project_status", "pending,in_progress,under_review,completed,cancelled")
                .Annotation("Npgsql:Enum:subscription_status", "pending,active,past_due,cancelled,expired")
                .Annotation("Npgsql:Enum:user_role", "customer,admin")
                .OldAnnotation("Npgsql:Enum:billing_cycle", "one_time,monthly,yearly")
                .OldAnnotation("Npgsql:Enum:file_type", "image,video,source_code_archive")
                .OldAnnotation("Npgsql:Enum:notification_type", "order_confirmed,download_ready,service_update,subscription_renewed,system")
                .OldAnnotation("Npgsql:Enum:order_status", "pending,paid,failed,refunded,cancelled")
                .OldAnnotation("Npgsql:Enum:payment_gateway", "vn_pay,momo,stripe,bank_transfer")
                .OldAnnotation("Npgsql:Enum:payment_status", "pending,success,failed")
                .OldAnnotation("Npgsql:Enum:plan_tier", "free,hobby,pro,enterprise")
                .OldAnnotation("Npgsql:Enum:product_type", "source_code,standalone_service")
                .OldAnnotation("Npgsql:Enum:service_project_status", "pending,in_progress,under_review,completed,cancelled")
                .OldAnnotation("Npgsql:Enum:subscription_status", "active,past_due,cancelled,expired")
                .OldAnnotation("Npgsql:Enum:user_role", "customer,admin");

            migrationBuilder.CreateTable(
                name: "BlogCategories",
                schema: "sourcehub",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlogCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Posts",
                schema: "sourcehub",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Slug = table.Column<string>(type: "character varying(600)", maxLength: 600, nullable: false),
                    Excerpt = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    ContentJson = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    CoverImageUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false),
                    ReadTimeMinutes = table.Column<int>(type: "integer", nullable: false),
                    ViewCount = table.Column<int>(type: "integer", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AuthorId = table.Column<Guid>(type: "uuid", nullable: false),
                    BlogCategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Posts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Posts_BlogCategories_BlogCategoryId",
                        column: x => x.BlogCategoryId,
                        principalSchema: "sourcehub",
                        principalTable: "BlogCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Posts_Users_AuthorId",
                        column: x => x.AuthorId,
                        principalSchema: "sourcehub",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PostMedia",
                schema: "sourcehub",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PostId = table.Column<Guid>(type: "uuid", nullable: false),
                    MediaType = table.Column<int>(type: "integer", nullable: false),
                    ObjectKey = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    FileName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    MimeType = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostMedia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PostMedia_Posts_PostId",
                        column: x => x.PostId,
                        principalSchema: "sourcehub",
                        principalTable: "Posts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PostTags",
                schema: "sourcehub",
                columns: table => new
                {
                    PostId = table.Column<Guid>(type: "uuid", nullable: false),
                    TagId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostTags", x => new { x.PostId, x.TagId });
                    table.ForeignKey(
                        name: "FK_PostTags_Posts_PostId",
                        column: x => x.PostId,
                        principalSchema: "sourcehub",
                        principalTable: "Posts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PostTags_Tags_TagId",
                        column: x => x.TagId,
                        principalSchema: "sourcehub",
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BlogCategories_Slug",
                schema: "sourcehub",
                table: "BlogCategories",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PostMedia_PostId",
                schema: "sourcehub",
                table: "PostMedia",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_AuthorId",
                schema: "sourcehub",
                table: "Posts",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_BlogCategoryId",
                schema: "sourcehub",
                table: "Posts",
                column: "BlogCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_PublishedAt",
                schema: "sourcehub",
                table: "Posts",
                column: "PublishedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_Slug",
                schema: "sourcehub",
                table: "Posts",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Posts_Status",
                schema: "sourcehub",
                table: "Posts",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_PostTags_TagId",
                schema: "sourcehub",
                table: "PostTags",
                column: "TagId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PostMedia",
                schema: "sourcehub");

            migrationBuilder.DropTable(
                name: "PostTags",
                schema: "sourcehub");

            migrationBuilder.DropTable(
                name: "Posts",
                schema: "sourcehub");

            migrationBuilder.DropTable(
                name: "BlogCategories",
                schema: "sourcehub");

            migrationBuilder.RenameTable(
                name: "WishlistItems",
                schema: "sourcehub",
                newName: "WishlistItems");

            migrationBuilder.RenameTable(
                name: "Users",
                schema: "sourcehub",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "Tags",
                schema: "sourcehub",
                newName: "Tags");

            migrationBuilder.RenameTable(
                name: "Subscriptions",
                schema: "sourcehub",
                newName: "Subscriptions");

            migrationBuilder.RenameTable(
                name: "SubscriptionPayments",
                schema: "sourcehub",
                newName: "SubscriptionPayments");

            migrationBuilder.RenameTable(
                name: "ServiceProjects",
                schema: "sourcehub",
                newName: "ServiceProjects");

            migrationBuilder.RenameTable(
                name: "Reviews",
                schema: "sourcehub",
                newName: "Reviews");

            migrationBuilder.RenameTable(
                name: "RefreshTokens",
                schema: "sourcehub",
                newName: "RefreshTokens");

            migrationBuilder.RenameTable(
                name: "ProductTags",
                schema: "sourcehub",
                newName: "ProductTags");

            migrationBuilder.RenameTable(
                name: "Products",
                schema: "sourcehub",
                newName: "Products");

            migrationBuilder.RenameTable(
                name: "ProductFiles",
                schema: "sourcehub",
                newName: "ProductFiles");

            migrationBuilder.RenameTable(
                name: "ProductAddons",
                schema: "sourcehub",
                newName: "ProductAddons");

            migrationBuilder.RenameTable(
                name: "Plans",
                schema: "sourcehub",
                newName: "Plans");

            migrationBuilder.RenameTable(
                name: "Payments",
                schema: "sourcehub",
                newName: "Payments");

            migrationBuilder.RenameTable(
                name: "Orders",
                schema: "sourcehub",
                newName: "Orders");

            migrationBuilder.RenameTable(
                name: "OrderItems",
                schema: "sourcehub",
                newName: "OrderItems");

            migrationBuilder.RenameTable(
                name: "OrderItemAddons",
                schema: "sourcehub",
                newName: "OrderItemAddons");

            migrationBuilder.RenameTable(
                name: "Notifications",
                schema: "sourcehub",
                newName: "Notifications");

            migrationBuilder.RenameTable(
                name: "LicenseKeys",
                schema: "sourcehub",
                newName: "LicenseKeys");

            migrationBuilder.RenameTable(
                name: "Downloads",
                schema: "sourcehub",
                newName: "Downloads");

            migrationBuilder.RenameTable(
                name: "Categories",
                schema: "sourcehub",
                newName: "Categories");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:billing_cycle", "one_time,monthly,yearly")
                .Annotation("Npgsql:Enum:file_type", "image,video,source_code_archive")
                .Annotation("Npgsql:Enum:notification_type", "order_confirmed,download_ready,service_update,subscription_renewed,system")
                .Annotation("Npgsql:Enum:order_status", "pending,paid,failed,refunded,cancelled")
                .Annotation("Npgsql:Enum:payment_gateway", "vn_pay,momo,stripe,bank_transfer")
                .Annotation("Npgsql:Enum:payment_status", "pending,success,failed")
                .Annotation("Npgsql:Enum:plan_tier", "free,hobby,pro,enterprise")
                .Annotation("Npgsql:Enum:product_type", "source_code,standalone_service")
                .Annotation("Npgsql:Enum:service_project_status", "pending,in_progress,under_review,completed,cancelled")
                .Annotation("Npgsql:Enum:subscription_status", "active,past_due,cancelled,expired")
                .Annotation("Npgsql:Enum:user_role", "customer,admin")
                .OldAnnotation("Npgsql:Enum:billing_cycle", "one_time,monthly,yearly")
                .OldAnnotation("Npgsql:Enum:file_type", "image,video,source_code_archive")
                .OldAnnotation("Npgsql:Enum:notification_type", "order_confirmed,download_ready,service_update,subscription_renewed,system")
                .OldAnnotation("Npgsql:Enum:order_status", "pending,paid,failed,refunded,cancelled")
                .OldAnnotation("Npgsql:Enum:payment_gateway", "vn_pay,momo,stripe,bank_transfer")
                .OldAnnotation("Npgsql:Enum:payment_status", "pending,success,failed")
                .OldAnnotation("Npgsql:Enum:plan_tier", "free,hobby,pro,enterprise")
                .OldAnnotation("Npgsql:Enum:post_media_type", "image,video,file")
                .OldAnnotation("Npgsql:Enum:post_status", "draft,published,archived")
                .OldAnnotation("Npgsql:Enum:product_type", "source_code,standalone_service")
                .OldAnnotation("Npgsql:Enum:service_project_status", "pending,in_progress,under_review,completed,cancelled")
                .OldAnnotation("Npgsql:Enum:subscription_status", "pending,active,past_due,cancelled,expired")
                .OldAnnotation("Npgsql:Enum:user_role", "customer,admin");
        }
    }
}
