using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Shopfront.API.Data;

#nullable disable

namespace Shopfront.API.Migrations
{
    [DbContext(typeof(ShopfrontDbContext))]
    [Migration("20260528120000_AddInventory")]
    public partial class AddInventory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InventoryItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TrackingToken = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProductTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Variation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BuyingPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsMoved = table.Column<bool>(type: "bit", nullable: false),
                    MovedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryItems_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InventoryMovements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InventoryItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FulfillmentNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MovedByEmail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ApprovedByEmail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MovedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryMovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryMovements_InventoryItems_InventoryItemId",
                        column: x => x.InventoryItemId,
                        principalTable: "InventoryItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryItems_OrderId",
                table: "InventoryItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMovements_InventoryItemId",
                table: "InventoryMovements",
                column: "InventoryItemId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "InventoryMovements");
            migrationBuilder.DropTable(name: "InventoryItems");
        }
    }
}
