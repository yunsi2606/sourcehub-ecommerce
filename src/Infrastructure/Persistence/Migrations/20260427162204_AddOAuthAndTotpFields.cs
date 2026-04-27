using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SourceEcommerce.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOAuthAndTotpFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Password",
                schema: "sourcehub",
                table: "Users",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "GithubId",
                schema: "sourcehub",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoogleId",
                schema: "sourcehub",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TotpEnabled",
                schema: "sourcehub",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TotpSecret",
                schema: "sourcehub",
                table: "Users",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GithubId",
                schema: "sourcehub",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "GoogleId",
                schema: "sourcehub",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TotpEnabled",
                schema: "sourcehub",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TotpSecret",
                schema: "sourcehub",
                table: "Users");

            migrationBuilder.AlterColumn<string>(
                name: "Password",
                schema: "sourcehub",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
