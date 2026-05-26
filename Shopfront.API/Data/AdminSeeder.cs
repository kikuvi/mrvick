using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shopfront.API.Authorization;
using Shopfront.API.Models;

namespace Shopfront.API.Data;

public static class AdminSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<AppUser>>();
        var db = services.GetRequiredService<ShopfrontDbContext>();

        // --- Admin user ---
        const string email    = "joneskikuvi@gmail.com";
        const string password = "Muthioni123!@#";

        var existing = await userManager.FindByEmailAsync(email);
        if (existing is null)
        {
            var user = new AppUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FullName = "John Kikuvi",
                PhoneNumber = "0712523444",
                MustChangePassword = false
            };
            var result = await userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Failed to seed admin user: {errors}");
            }
            Console.WriteLine($"Admin user created: {email}");
        }
        else
        {
            // Update existing admin details if needed
            existing.FullName = "John Kikuvi";
            existing.PhoneNumber = "0712523444";
            existing.MustChangePassword = false;
            existing.IsActive = true;
            await userManager.UpdateAsync(existing);

            // Update email/username if old admin still exists
            if (existing.Email != email)
            {
                existing.Email = email;
                existing.UserName = email;
                existing.NormalizedEmail = email.ToUpperInvariant();
                existing.NormalizedUserName = email.ToUpperInvariant();
                await userManager.UpdateAsync(existing);
            }

            // Ensure password is set to new one
            var token = await userManager.GeneratePasswordResetTokenAsync(existing);
            await userManager.ResetPasswordAsync(existing, token, password);
        }

        // ── Admin Role & Permissions ──────────────────────────────────────────
        const string adminRoleName = "Admin";
        var adminRole = await db.AppRoles.FirstOrDefaultAsync(r => r.Name == adminRoleName);
        if (adminRole is null)
        {
            adminRole = new AppRole { Name = adminRoleName, Description = "Full system access" };
            db.AppRoles.Add(adminRole);
            await db.SaveChangesAsync();
        }

        // Ensure all permissions are assigned to the Admin role
        var existingPerms = await db.RolePermissions
            .Where(rp => rp.RoleId == adminRole.Id)
            .Select(rp => rp.Permission)
            .ToListAsync();

        var missingPerms = Permissions.All.Except(existingPerms).ToList();
        if (missingPerms.Count > 0)
        {
            db.RolePermissions.AddRange(missingPerms.Select(p => new RolePermission
            {
                RoleId = adminRole.Id,
                Permission = p
            }));
            await db.SaveChangesAsync();
        }

        // Assign the Admin role to the admin user if not already assigned
        var adminUser = await userManager.FindByEmailAsync(email);
        if (adminUser is not null)
        {
            var hasAdminRole = await db.AppUserRoles.AnyAsync(ur => ur.UserId == adminUser.Id && ur.RoleId == adminRole.Id);
            if (!hasAdminRole)
            {
                db.AppUserRoles.Add(new UserRole { UserId = adminUser.Id, RoleId = adminRole.Id });
                await db.SaveChangesAsync();
            }
        }

        // Also remove old admin account if it still exists
        var oldAdmin = await userManager.FindByEmailAsync("admin@shopfront.co.ke");
        if (oldAdmin is not null && oldAdmin.Email != email)
        {
            await userManager.DeleteAsync(oldAdmin);
            Console.WriteLine("Removed old admin@shopfront.co.ke account.");
        }

        // --- Page content ---
        await UpdatePageAsync(db, "home",
            title: "Quality Products, Delivered to Your Door",
            metaDesc: "Shopfront — Kenya's trusted online store. Shop top products and get fast delivery to your doorstep.",
            content: @"<div class='home-features'>
  <h2>Why Shop With Us?</h2>
  <div class='features-grid'>
    <div class='feature-card'>
      <div class='feature-icon'>🚀</div>
      <h3>Fast Delivery</h3>
      <p>Same-day delivery across Nairobi and next-day nationwide. Our riders know every route.</p>
    </div>
    <div class='feature-card'>
      <div class='feature-icon'>✅</div>
      <h3>Genuine Products</h3>
      <p>Every item is carefully vetted. No counterfeits, no compromise on quality.</p>
    </div>
    <div class='feature-card'>
      <div class='feature-icon'>📦</div>
      <h3>Easy Ordering</h3>
      <p>Place an order in under 2 minutes. Pay on delivery — no upfront payment needed.</p>
    </div>
    <div class='feature-card'>
      <div class='feature-icon'>📍</div>
      <h3>Track Your Order</h3>
      <p>Get a unique tracking code with every order. Follow your delivery in real time.</p>
    </div>
  </div>
</div>");

        await UpdatePageAsync(db, "about",
            title: "About Shopfront",
            metaDesc: "Learn about Shopfront — our story, mission and commitment to quality products and fast delivery across Kenya.",
            content: @"<div class='about-content'>
  <div class='about-hero'>
    <h1>About Shopfront</h1>
    <p class='lead'>We started with a simple idea: make it easy for every Kenyan to access quality products without leaving home.</p>
  </div>

  <div class='about-story'>
    <h2>Our Story</h2>
    <p>Shopfront was born out of frustration with the hassle of shopping — long queues, limited stock, and unreliable deliveries. We set out to build something better: a platform where you can browse genuine products, place an order in minutes, and have it at your door the same day.</p>
    <p>From our humble beginnings in Nairobi, we have grown to serve customers across all 47 counties in Kenya, partnering with a trusted network of local riders who know their neighbourhoods inside out.</p>
  </div>

  <div class='about-values'>
    <h2>What We Stand For</h2>
    <div class='values-grid'>
      <div class='value-card'>
        <h3>&#10003; Quality You Can Trust</h3>
        <p>Every product on Shopfront is carefully vetted. We only list items we would buy ourselves.</p>
      </div>
      <div class='value-card'>
        <h3>&#128665; Fast &amp; Reliable Delivery</h3>
        <p>Our network of dedicated riders ensures your order reaches you quickly, safely, and in perfect condition.</p>
      </div>
      <div class='value-card'>
        <h3>&#9733; Customer First</h3>
        <p>Your satisfaction is our priority. If something goes wrong, our team is here to make it right — no questions asked.</p>
      </div>
      <div class='value-card'>
        <h3>&#127968; Supporting Local</h3>
        <p>We work with local suppliers and riders, creating jobs and keeping money within our communities.</p>
      </div>
    </div>
  </div>

  <div class='about-promise'>
    <h2>Our Promise to You</h2>
    <p>When you shop with Shopfront, you get more than just a product — you get peace of mind. Every order comes with a unique tracking code so you can follow your delivery in real time. And if for any reason you are not satisfied, our customer care team is just a call or message away.</p>
    <p><strong>Shop smart. Shop with confidence. Shop Shopfront.</strong></p>
  </div>
</div>");

        await UpdatePageAsync(db, "contact",
            title: "Get in Touch",
            metaDesc: "Contact Shopfront — we are here to help with your orders, questions and feedback.",
            content: @"<div class='contact-intro'>
  <h2>We'd Love to Hear From You</h2>
  <p>Have a question about an order? Need help choosing the right product? Or just want to say hello? Our friendly team is ready to help — reach out through any of the channels below and we will get back to you as soon as possible.</p>
  <div class='response-notice'>
    <strong>Response Times:</strong>
    <ul>
      <li>Phone &amp; WhatsApp — within 1 hour (Mon–Sat, 8 am–8 pm)</li>
      <li>Email — within 24 hours</li>
    </ul>
  </div>
</div>");
    }

    private static async Task UpdatePageAsync(ShopfrontDbContext db, string slug, string title, string metaDesc, string content)
    {
        var page = await db.Pages.FirstOrDefaultAsync(p => p.Slug == slug);
        if (page is null) return;

        page.Title = title;
        page.MetaDesc = metaDesc;
        page.Content = content;
        page.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }
}
