using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace expensetracker.Migrations
{
    /// <inheritdoc />
    public partial class AddFeedbackTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "feedback",
                columns: table => new
                {
                    aid = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    id = table.Column<int>(type: "INTEGER", nullable: false),
                    msg = table.Column<string>(type: "TEXT", nullable: false),
                    admin_reply = table.Column<string>(type: "TEXT", nullable: false),
                    createdat = table.Column<DateTime>(type: "TEXT", nullable: false),
                    repliedat = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_feedback", x => x.aid);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "feedback");
        }
    }
}
