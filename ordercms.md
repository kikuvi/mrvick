# Shopfront — Custom Commerce + Delivery System

## Overview

A custom CMS to:
- Create product pages (text + images)
- Display pricing (original + discounted)
- Capture customer orders (no checkout)
- Manage delivery (riders)
- Track expenses and profit
- Manage static pages (Homepage, About Us, Contact)

---

## Technology Stack

| Layer        | Technology                        | Notes                                      |
|--------------|-----------------------------------|--------------------------------------------|
| Frontend     | Angular                           | SPA — public site + admin panel            |
| Backend      | ASP.NET Core Web API (C#)         | REST API                                   |
| ORM          | Entity Framework Core             | Code-first migrations                      |
| Database     | Microsoft SQL Server (MSSQL)      |                                            |
| SMS          | Africa's Talking                  | .NET SDK available                         |
| Email        | SendGrid                          | .NET SDK available                         |
| Auth         | ASP.NET Core Identity + JWT       | Admin panel authentication                 |
| Hosting      | Azure App Service + Azure SQL     | Natural fit for .NET                       |

---

## System Architecture

### Table: `products`

| Column         | Type      | Notes                  |
|----------------|-----------|------------------------|
| id             | integer   | Primary key            |
| title          | string    |                        |
| description    | text      |                        |
| price          | decimal   | Original price         |
| discount_price | decimal   | Sale price             |
| created_at     | timestamp |                        |

### Table: `product_images`

| Column     | Type    | Notes                        |
|------------|---------|------------------------------|
| id         | integer | Primary key                  |
| product_id | integer | Foreign key → products.id    |
| image_url  | string  |                              |

### Table: `orders`

| Column            | Type      | Notes                                        |
|-------------------|-----------|----------------------------------------------|
| id                | integer   | Primary key                                  |
| tracking_token    | string    | Unique token — used for public order tracking |
| product_id        | integer   | Foreign key → products.id                    |
| customer_name     | string    |                                              |
| phone             | string    |                                              |
| email             | string    | Optional                                     |
| county            | string    |                                              |
| delivery_address  | string    |                                              |
| price_at_order    | decimal   | Snapshot of price at time of order           |
| advertising_cost  | decimal   |                                              |
| delivery_fee      | decimal   |                                              |
| status            | enum      | `new`, `assigned`, `in_transit`, `delivered`, `rejected` |
| rider_id          | integer   | Nullable — foreign key → riders.id           |
| created_at        | timestamp |                                              |

### Table: `site_settings`

| Column       | Type      | Notes                                          |
|--------------|-----------|------------------------------------------------|
| id           | integer   | Primary key                                    |
| key          | string    | Unique identifier e.g. `site_name`, `logo_url` |
| value        | text      |                                                |
| updated_at   | timestamp |                                                |

### Table: `pages`

| Column     | Type      | Notes                                        |
|------------|-----------|----------------------------------------------|
| id         | integer   | Primary key                                  |
| slug       | string    | `home`, `about`, `contact`                   |
| title      | string    |                                              |
| content    | text      | Rich text / HTML                             |
| meta_desc  | string    | SEO description                              |
| updated_at | timestamp |                                              |

### Table: `riders`

| Column     | Type      | Notes       |
|------------|-----------|-------------|
| id         | integer   | Primary key |
| name       | string    |             |
| phone      | string    |             |
| county     | string    |             |
| local_town | string    |             |
| created_at | timestamp |             |

---

## System Flow

### Product Flow

1. Admin creates a product
2. Admin fills in:
   - Title
   - Description
   - 2–5 images
   - Original price + discount price
3. System generates the product page

### Order Flow

1. Customer opens the product page
2. Customer fills in the order form:
   - Name
   - Phone
   - Email *(optional)*
   - County
   - Delivery address
3. Order is saved with:
   - `status = new`
   - `price_at_order` snapshot
   - Unique `tracking_token` generated
4. System sends notifications:
   - **SMS** to customer's phone — order confirmation + tracking link
   - **Email** to customer's email — order confirmation + tracking link *(if email provided)*
   - **SMS** to admin — new order alert

### Delivery Flow

1. Admin assigns a rider → `status = assigned`
2. Rider picks up order → admin updates `status = in_transit`
3. Rider delivers → admin updates `status = delivered` or `rejected`
4. Customer receives **SMS/email** on each status change

---

## Pricing Logic

### Display

- Original price → ~~strikethrough~~
- Discount price → **bold**

### Profit Formula

```
profit = price_at_order - (advertising_cost + delivery_fee)
```

---

## Frontend: Product Page Layout

```
[Title]

[Image Gallery]

[Price Section]
  ~~Original Price~~   **Discount Price**

[Description]

--- Order Form ---
  Name
  Phone
  Email
  County
  Delivery Address

[Submit]
```

### Homepage — `/`

```
[Header — Shopfront Logo + Nav: Home | About | Contact]

[Hero Section]
  Headline
  Subheadline
  [CTA Button → Products]

[Featured Products]
  Product Card  Product Card  Product Card ...

[Footer — Contact info | Links]
```

### About Us Page — `/about`

```
[Header — Logo + Nav]

[Page Title: About Us]

[Content — rich text / paragraphs + optional image]

[Footer]
```

### Contact Page — `/contact`

```
[Header — Logo + Nav]

[Page Title: Contact Us]

[Contact Details]
  Phone
  Email
  Location / Address

[Contact Form]
  Name
  Email
  Message
  [Send]

[Footer]
```

### Order Tracking Page — `/track/:token`

```
[Order #token]

[Status Timeline]
  ✓ Order Placed
  ✓ Rider Assigned
  ○ In Transit
  ○ Delivered

[Order Summary]
  Product
  Customer Name
  Delivery Address
  Amount Paid
```

---

## API Endpoints

### Pages

| Method | Endpoint          | Description                          |
|--------|-------------------|--------------------------------------|
| GET    | `/pages/:slug`    | Get page content by slug             |
| PATCH  | `/pages/:slug`    | Update page content (admin)          |

### Site Settings

| Method | Endpoint          | Description                          |
|--------|-------------------|--------------------------------------|
| GET    | `/settings`       | Get all site settings                |
| PATCH  | `/settings`       | Update site settings (admin)         |

### Products

| Method | Endpoint          | Description         |
|--------|-------------------|---------------------|
| POST   | `/products`       | Create a product    |
| GET    | `/products`       | List all products   |
| GET    | `/products/:id`   | Get product by ID   |

### Orders

| Method | Endpoint                        | Description                          |
|--------|---------------------------------|--------------------------------------|
| POST   | `/orders`                       | Place an order                       |
| GET    | `/orders`                       | List all orders (admin)              |
| GET    | `/orders/track/:token`          | Public order tracking by token       |
| PATCH  | `/orders/:id/status`            | Update order status                  |
| PATCH  | `/orders/:id/assign`            | Assign rider to order                |
| PATCH  | `/orders/:id/expenses`          | Update order expenses                |

### Riders

| Method | Endpoint    | Description       |
|--------|-------------|-------------------|
|POST    | `/riders`   | Register a rider  |
| GET    | `/riders`   | List all riders   |

---

## Notifications

### Triggers

| Event              | Recipient | Channel | Message                                        |
|--------------------|-----------|---------|------------------------------------------------|
| Order placed       | Customer  | SMS     | Confirmation + tracking link                   |
| Order placed       | Customer  | Email   | Confirmation + tracking link *(if email provided)* |
| Order placed       | Admin     | SMS     | New order alert                                |
| Status → assigned  | Customer  | SMS     | "Your order has been assigned to a rider"      |
| Status → in_transit| Customer  | SMS     | "Your order is on the way"                     |
| Status → delivered | Customer  | SMS     | "Your order has been delivered"                |
| Status → rejected  | Customer  | SMS     | "Your order could not be fulfilled"            |

### Services

- **SMS** — Africa's Talking (`AfricasTalking` .NET NuGet package)
- **Email** — SendGrid (`SendGrid` .NET NuGet package)

---

## UI Themes & Design Resources

### Recommended Angular Themes

| Theme | Style | Link |
|-------|-------|------|
| **TailAdmin Angular** | Clean, Tailwind CSS v4, 500+ components | [tailadmin.com](https://tailadmin.com/blog/angular-dashboard-templates) |
| **Berry Angular** | Bootstrap 5, modern layout, ApexCharts | [graygrids.com](https://graygrids.com/blog/best-angular-ecommerce-templates) |
| **Material Dashboard Angular** | Google Material Design, clean & minimal | [colorlib.com](https://colorlib.com/wp/free-angular-templates/) |
| **ngx-admin** | Nebular UI, 40+ components, 25k+ GitHub stars | [github.com/akveo/ngx-admin](https://github.com/akveo/ngx-admin) |
| **Angular 17 Ecommerce Template** | Modern storefront, responsive | [github.com/JassaRich](https://github.com/JassaRich/angularecommerceprojectfree) |
| **Angular + Material Store** | Angular Material Design storefront | [github.com/kmturley](https://github.com/kmturley/angular-ecommerce) |

> **Recommendation:** Use **TailAdmin Angular** for the admin panel and **Angular 17 Ecommerce Template** as a base for the public storefront.

### Free Stock Image Sources

| Source | Notes |
|--------|-------|
| [Unsplash](https://unsplash.com/s/photos/e-commerce) | High quality, free for commercial use, no attribution required |
| [Pexels](https://www.pexels.com/search/e-commerce/) | 30,000+ e-commerce photos, completely free |
| [Pixabay](https://pixabay.com/images/search/ecommerce/) | Royalty-free, no attribution needed |
| [Freepik](https://www.freepik.com/free-photos-vectors/e-commerce) | Free vectors, photos, and PSD files |
| [Shopify Burst](https://www.shopify.com/stock-photos/ecommerce) | E-commerce focused, free for commercial use |

> **Note:** Always verify the license on each image before use in production.

---

## Summary

**Shopfront** is a complete Commerce + Delivery + Profit Tracking system with no checkout flow. Built with Angular (frontend) and ASP.NET Core (backend). Customers place orders directly from product pages, admin manages fulfillment and rider assignments, and the system tracks profit per order.
