using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace expensetracker.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentMethodToExpense2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "paymeny_method",
                table: "Expenses",
                newName: "payment_method");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "payment_method",
                table: "Expenses",
                newName: "paymeny_method");
        }
    }
}
