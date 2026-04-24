using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Models;

namespace Shopfront.API.Data;

public class ShopfrontDbContext : IdentityDbContext
{
    public ShopfrontDbContext(DbContextOptions<ShopfrontDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Rider> Riders => Set<Rider>();
    public DbSet<Page> Pages => Set<Page>();
    public DbSet<SiteSetting> SiteSettings => Set<SiteSetting>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Product>(e =>
        {
            e.Property(p => p.Price).HasColumnType("decimal(18,2)");
            e.Property(p => p.DiscountPrice).HasColumnType("decimal(18,2)");
        });

        builder.Entity<Order>(e =>
        {
            e.Property(o => o.PriceAtOrder).HasColumnType("decimal(18,2)");
            e.Property(o => o.AdvertisingCost).HasColumnType("decimal(18,2)");
            e.Property(o => o.DeliveryFee).HasColumnType("decimal(18,2)");
            e.Property(o => o.Status).HasConversion<string>();
            e.HasIndex(o => o.TrackingToken).IsUnique();
        });

        builder.Entity<SiteSetting>(e =>
        {
            e.HasIndex(s => s.Key).IsUnique();
        });

        builder.Entity<Page>(e =>
        {
            e.HasIndex(p => p.Slug).IsUnique();
        });

        // Seed static pages (content is updated by AdminSeeder on startup)
        builder.Entity<Page>().HasData(
            new Page { Id = 1, Slug = "home", Title = "Welcome to Shopfront", Content = "<p>Your one-stop shop.</p>", MetaDesc = "Shopfront - Quality products delivered to your door.", UpdatedAt = new DateTime(2026, 1, 1) },
            new Page { Id = 2, Slug = "about", Title = "About Us", Content = "<p>We are Shopfront, bringing quality products to your doorstep.</p>", MetaDesc = "Learn more about Shopfront.", UpdatedAt = new DateTime(2026, 1, 1) },
            new Page { Id = 3, Slug = "contact", Title = "Contact Us", Content = "", MetaDesc = "Get in touch with Shopfront.", UpdatedAt = new DateTime(2026, 1, 1) }
        );

        // Seed default site settings
        builder.Entity<SiteSetting>().HasData(
            new SiteSetting { Id = 1, Key = "site_name", Value = "Shopfront", UpdatedAt = new DateTime(2026, 1, 1) },
            new SiteSetting { Id = 2, Key = "site_email", Value = "info@shopfront.co.ke", UpdatedAt = new DateTime(2026, 1, 1) },
            new SiteSetting { Id = 3, Key = "site_phone", Value = "+254700000000", UpdatedAt = new DateTime(2026, 1, 1) },
            new SiteSetting { Id = 4, Key = "site_address", Value = "Nairobi, Kenya", UpdatedAt = new DateTime(2026, 1, 1) },
            new SiteSetting { Id = 5, Key = "logo_url", Value = "/assets/logo.png", UpdatedAt = new DateTime(2026, 1, 1) }
        );
    }
}
