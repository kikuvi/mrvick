using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Models;

namespace Shopfront.API.Data;

public class ShopfrontDbContext : IdentityDbContext<AppUser>
{
    public ShopfrontDbContext(DbContextOptions<ShopfrontDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductVariation> ProductVariations => Set<ProductVariation>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Rider> Riders => Set<Rider>();
    public DbSet<Courier> Couriers => Set<Courier>();
    public DbSet<CourierOffice> CourierOffices => Set<CourierOffice>();
    public DbSet<Page> Pages => Set<Page>();
    public DbSet<SiteSetting> SiteSettings => Set<SiteSetting>();
    public DbSet<VendorItem> VendorItems => Set<VendorItem>();
    public DbSet<ProductRating> ProductRatings => Set<ProductRating>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<OrderNote> OrderNotes => Set<OrderNote>();
    public DbSet<PageView> PageViews => Set<PageView>();
    public DbSet<PixelEvent> PixelEvents => Set<PixelEvent>();
    public DbSet<Agent> Agents => Set<Agent>();
    public DbSet<AppNotification> AppNotifications => Set<AppNotification>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<AppRole> AppRoles => Set<AppRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserRole> AppUserRoles => Set<UserRole>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<VendorItem>(e =>
        {
            e.Property(v => v.Price).HasColumnType("decimal(18,2)");
        });

        builder.Entity<ProductVariation>(e =>
        {
            e.HasOne(v => v.Product)
             .WithMany(p => p.Variations)
             .HasForeignKey(v => v.ProductId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ProductRating>(e =>
        {
            e.HasOne(r => r.Product)
             .WithMany(p => p.Ratings)
             .HasForeignKey(r => r.ProductId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Product>(e =>
        {
            e.Property(p => p.Price).HasColumnType("decimal(18,2)");
            e.Property(p => p.DiscountPrice).HasColumnType("decimal(18,2)");
        });

        builder.Entity<Order>(e =>
        {
            e.Property(o => o.PriceAtOrder).HasColumnType("decimal(18,2)");
            e.Property(o => o.BuyingPrice).HasColumnType("decimal(18,2)");
            e.Property(o => o.AdvertisingCost).HasColumnType("decimal(18,2)");
            e.Property(o => o.DeliveryFee).HasColumnType("decimal(18,2)");
            e.Property(o => o.Status).HasConversion<string>();
            e.HasIndex(o => o.TrackingToken).IsUnique();
        });

        builder.Entity<SiteSetting>(e =>
        {
            e.HasIndex(s => s.Key).IsUnique();
        });

        builder.Entity<PageView>(e =>
        {
            e.Property(p => p.Path).HasMaxLength(500);
            e.HasIndex(p => new { p.Path, p.Date }).IsUnique();
        });

        builder.Entity<PixelEvent>(e =>
        {
            e.Property(p => p.EventName).HasMaxLength(50);
            e.Property(p => p.Source).HasMaxLength(10);
            e.Property(p => p.EventId).HasMaxLength(100);
            e.Property(p => p.ProductId).HasMaxLength(50);
            e.Property(p => p.Value).HasColumnType("decimal(18,2)");
        });

        builder.Entity<Expense>(e =>
        {
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            e.Property(x => x.Status).HasConversion<string>();
        });

        builder.Entity<Page>(e =>
        {
            e.HasIndex(p => p.Slug).IsUnique();
        });

        builder.Entity<AppRole>(e =>
        {
            e.HasIndex(r => r.Name).IsUnique();
        });

        builder.Entity<RolePermission>(e =>
        {
            e.HasOne(rp => rp.Role)
             .WithMany(r => r.Permissions)
             .HasForeignKey(rp => rp.RoleId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(rp => new { rp.RoleId, rp.Permission }).IsUnique();
        });

        builder.Entity<UserRole>(e =>
        {
            e.ToTable("AppUserRoles"); // explicit table name to match DB
            e.HasOne(ur => ur.User)
             .WithMany()
             .HasForeignKey(ur => ur.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ur => ur.Role)
             .WithMany(r => r.UserRoles)
             .HasForeignKey(ur => ur.RoleId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(ur => new { ur.UserId, ur.RoleId }).IsUnique();
        });

        // Seed static pages
        builder.Entity<Page>().HasData(
            new Page { Id = new Guid("a0000000-0000-0000-0000-000000000001"), Slug = "home", Title = "Welcome to Shopfront", Content = "<p>Your one-stop shop.</p>", MetaDesc = "Shopfront - Quality products delivered to your door.", UpdatedAt = new DateTime(2026, 1, 1) },
            new Page { Id = new Guid("a0000000-0000-0000-0000-000000000002"), Slug = "about", Title = "About Us", Content = "<p>We are Shopfront, bringing quality products to your doorstep.</p>", MetaDesc = "Learn more about Shopfront.", UpdatedAt = new DateTime(2026, 1, 1) },
            new Page { Id = new Guid("a0000000-0000-0000-0000-000000000003"), Slug = "contact", Title = "Contact Us", Content = "", MetaDesc = "Get in touch with Shopfront.", UpdatedAt = new DateTime(2026, 1, 1) },
            new Page { Id = new Guid("a0000000-0000-0000-0000-000000000004"), Slug = "thank-you", Title = "Thank You for Your Order!", Content = "<p>We've received your order and will be in touch shortly. Delivery is on its way!</p>", MetaDesc = "Order placed successfully.", UpdatedAt = new DateTime(2026, 1, 1) }
        );

        // Seed default site settings
        builder.Entity<SiteSetting>().HasData(
            new SiteSetting { Id = new Guid("b0000000-0000-0000-0000-000000000001"), Key = "site_name", Value = "Shopfront", UpdatedAt = new DateTime(2026, 1, 1) },
            new SiteSetting { Id = new Guid("b0000000-0000-0000-0000-000000000002"), Key = "site_email", Value = "info@shopfront.co.ke", UpdatedAt = new DateTime(2026, 1, 1) },
            new SiteSetting { Id = new Guid("b0000000-0000-0000-0000-000000000003"), Key = "site_phone", Value = "+254712637250", UpdatedAt = new DateTime(2026, 1, 1) },
            new SiteSetting { Id = new Guid("b0000000-0000-0000-0000-000000000004"), Key = "site_address", Value = "Nairobi, Kenya", UpdatedAt = new DateTime(2026, 1, 1) },
            new SiteSetting { Id = new Guid("b0000000-0000-0000-0000-000000000005"), Key = "logo_url", Value = "/assets/logo.png", UpdatedAt = new DateTime(2026, 1, 1) }
        );
    }
}
