using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shopfront.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCouriers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CourierId",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Couriers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Couriers", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_CourierId",
                table: "Orders",
                column: "CourierId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Couriers_CourierId",
                table: "Orders",
                column: "CourierId",
                principalTable: "Couriers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Couriers_CourierId",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "Couriers");

            migrationBuilder.DropIndex(
                name: "IX_Orders_CourierId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CourierId",
                table: "Orders");
        }
    }
}
