using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace expensetracker.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUidFromCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "id",
                table: "category");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "id",
                table: "category",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }
    }
}
