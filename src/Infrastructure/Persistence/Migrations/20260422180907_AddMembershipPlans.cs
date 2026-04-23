using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SourceEcommerce.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMembershipPlans : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                .OldAnnotation("Npgsql:Enum:product_type", "source_code,standalone_service")
                .OldAnnotation("Npgsql:Enum:service_project_status", "pending,in_progress,under_review,completed,cancelled")
                .OldAnnotation("Npgsql:Enum:subscription_status", "active,past_due,cancelled,expired")
                .OldAnnotation("Npgsql:Enum:user_role", "customer,admin");

            migrationBuilder.AlterColumn<Guid>(
                name: "OrderItemId",
                table: "Subscriptions",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<int>(
                name: "BillingCycle",
                table: "Subscriptions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "PlanId",
                table: "Subscriptions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeCustomerId",
                table: "Subscriptions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeSubscriptionId",
                table: "Subscriptions",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Plans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Tier = table.Column<int>(type: "integer", nullable: false),
                    MonthlyPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    YearlyPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    FeaturesJson = table.Column<string>(type: "text", nullable: false),
                    StripePriceIdMonthly = table.Column<string>(type: "text", nullable: true),
                    StripePriceIdYearly = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plans", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_PlanId",
                table: "Subscriptions",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_Plans_IsActive",
                table: "Plans",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Plans_Slug",
                table: "Plans",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Plans_Tier",
                table: "Plans",
                column: "Tier");

            migrationBuilder.AddForeignKey(
                name: "FK_Subscriptions_Plans_PlanId",
                table: "Subscriptions",
                column: "PlanId",
                principalTable: "Plans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Subscriptions_Plans_PlanId",
                table: "Subscriptions");

            migrationBuilder.DropTable(
                name: "Plans");

            migrationBuilder.DropIndex(
                name: "IX_Subscriptions_PlanId",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "BillingCycle",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "PlanId",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "StripeCustomerId",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "StripeSubscriptionId",
                table: "Subscriptions");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:billing_cycle", "one_time,monthly,yearly")
                .Annotation("Npgsql:Enum:file_type", "image,video,source_code_archive")
                .Annotation("Npgsql:Enum:notification_type", "order_confirmed,download_ready,service_update,subscription_renewed,system")
                .Annotation("Npgsql:Enum:order_status", "pending,paid,failed,refunded,cancelled")
                .Annotation("Npgsql:Enum:payment_gateway", "vn_pay,momo,stripe,bank_transfer")
                .Annotation("Npgsql:Enum:payment_status", "pending,success,failed")
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
                .OldAnnotation("Npgsql:Enum:product_type", "source_code,standalone_service")
                .OldAnnotation("Npgsql:Enum:service_project_status", "pending,in_progress,under_review,completed,cancelled")
                .OldAnnotation("Npgsql:Enum:subscription_status", "active,past_due,cancelled,expired")
                .OldAnnotation("Npgsql:Enum:user_role", "customer,admin");

            migrationBuilder.AlterColumn<Guid>(
                name: "OrderItemId",
                table: "Subscriptions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
