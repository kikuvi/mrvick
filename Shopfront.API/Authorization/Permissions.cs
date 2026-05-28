namespace Shopfront.API.Authorization;

/// <summary>All permission keys used across the system.</summary>
public static class Permissions
{
    // ── Dashboard ──────────────────────────────────────────────────────
    public const string Dashboard = "dashboard";

    // ── Orders ────────────────────────────────────────────────────────
    public const string ViewOrders   = "orders.view";
    public const string ManageOrders = "orders.manage";   // status, assign, archive, notes, expenses

    // ── Products ──────────────────────────────────────────────────────
    public const string ViewProducts   = "products.view";
    public const string ManageProducts = "products.manage";

    // ── Riders ────────────────────────────────────────────────────────
    public const string ViewRiders   = "riders.view";
    public const string ManageRiders = "riders.manage";

    // ── Couriers ──────────────────────────────────────────────────────
    public const string ViewCouriers   = "couriers.view";
    public const string ManageCouriers = "couriers.manage";

    // ── Agents ────────────────────────────────────────────────────────
    public const string ViewAgents   = "agents.view";
    public const string ManageAgents = "agents.manage";

    // ── Expenses ──────────────────────────────────────────────────────
    public const string ViewExpenses   = "expenses.view";
    public const string ManageExpenses = "expenses.manage";

    // ── Users ─────────────────────────────────────────────────────────
    public const string ViewUsers   = "users.view";
    public const string ManageUsers = "users.manage";

    // ── Permissions ───────────────────────────────────────────────────
    public const string ManagePermissions = "permissions.manage";

    // ── Content ───────────────────────────────────────────────────────
    public const string ManagePages    = "pages.manage";
    public const string ManageSettings = "settings.manage";

    // ── Vendors ───────────────────────────────────────────────────────
    public const string ViewVendors   = "vendors.view";
    public const string ManageVendors = "vendors.manage";

    // ── Revenue ───────────────────────────────────────────────────────
    public const string ViewRevenue = "revenue.view";

    // ── Inventory ─────────────────────────────────────────────────────
    public const string ViewInventory   = "inventory.view";
    public const string ManageInventory = "inventory.manage";

    // ── Reports ───────────────────────────────────────────────────────
    public const string ViewReviews     = "reviews.view";
    public const string ViewAuditLogs   = "audit_logs.view";
    public const string ViewPageViews   = "page_views.view";
    public const string ViewConversions = "conversions.view";

    /// <summary>Every permission in the system, ordered by module.</summary>
    public static readonly string[] All =
    [
        Dashboard,
        ViewOrders,   ManageOrders,
        ViewProducts, ManageProducts,
        ViewRiders,   ManageRiders,
        ViewCouriers, ManageCouriers,
        ViewAgents,   ManageAgents,
        ViewExpenses, ManageExpenses,
        ViewUsers,    ManageUsers,
        ManagePermissions,
        ManagePages,  ManageSettings,
        ViewVendors,  ManageVendors,
        ViewRevenue,
        ViewInventory, ManageInventory,
        ViewReviews,  ViewAuditLogs, ViewPageViews, ViewConversions,
    ];

    /// <summary>Human-readable label for display in the UI.</summary>
    public static string Label(string perm) => perm switch
    {
        Dashboard        => "View Dashboard",
        ViewOrders       => "View Orders",
        ManageOrders     => "Manage Orders (status, assign, archive)",
        ViewProducts     => "View Products",
        ManageProducts   => "Manage Products (create / edit / delete)",
        ViewRiders       => "View Riders",
        ManageRiders     => "Manage Riders",
        ViewCouriers     => "View Couriers",
        ManageCouriers   => "Manage Couriers",
        ViewAgents       => "View Agents",
        ManageAgents     => "Manage Agents",
        ViewExpenses     => "View Expenses",
        ManageExpenses   => "Manage Expenses (create / edit / delete)",
        ViewUsers        => "View Users",
        ManageUsers      => "Manage Users (create / edit / deactivate)",
        ManagePermissions => "Manage User Permissions",
        ManagePages      => "Manage Content Pages",
        ManageSettings   => "Manage Site Settings",
        ViewVendors      => "View Vendor Items",
        ManageVendors    => "Manage Vendor Items",
        ViewRevenue      => "View Revenue",
        ViewInventory    => "View Inventory",
        ManageInventory  => "Manage Inventory (move items)",
        ViewReviews      => "View Reviews",
        ViewAuditLogs    => "View Audit Logs",
        ViewPageViews    => "View Page Views",
        ViewConversions  => "View Conversions API",
        _                => perm,
    };

    /// <summary>Module group name for display.</summary>
    public static string Group(string perm) => perm switch
    {
        Dashboard => "Dashboard",
        var p when p.StartsWith("orders")      => "Orders",
        var p when p.StartsWith("products")    => "Products",
        var p when p.StartsWith("riders")      => "Riders",
        var p when p.StartsWith("couriers")    => "Couriers",
        var p when p.StartsWith("agents")      => "Agents",
        var p when p.StartsWith("expenses")    => "Expenses",
        var p when p.StartsWith("users")       => "Users",
        var p when p.StartsWith("permissions") => "Permissions",
        var p when p.StartsWith("pages")       => "Content",
        var p when p.StartsWith("settings")    => "Content",
        var p when p.StartsWith("vendors")     => "Vendors",
        var p when p.StartsWith("revenue")     => "Revenue",
        var p when p.StartsWith("inventory")   => "Inventory",
        var p when p.StartsWith("reviews")     => "Reports",
        var p when p.StartsWith("audit_logs")  => "Reports",
        var p when p.StartsWith("page_views")  => "Reports",
        var p when p.StartsWith("conversions") => "Reports",
        _ => "Other",
    };
}
