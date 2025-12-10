using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace expensetracker.Migrations
{
    /// <inheritdoc />
    public partial class addBudget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "budget",
                columns: table => new
                {
                    bid = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    id = table.Column<int>(type: "INTEGER", nullable: false),
                    amount = table.Column<int>(type: "INTEGER", nullable: false),
                    month_year = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_budget", x => x.bid);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "budget");
        }
    }
}
