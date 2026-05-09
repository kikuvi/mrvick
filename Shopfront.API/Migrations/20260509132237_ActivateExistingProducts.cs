using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shopfront.API.Migrations
{
    /// <inheritdoc />
    public partial class ActivateExistingProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE Products SET IsActive = 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
