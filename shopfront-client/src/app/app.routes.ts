import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/public/home/home').then(m => m.HomeComponent) },
  { path: 'about', loadComponent: () => import('./components/public/about/about').then(m => m.AboutComponent) },
  { path: 'contact', loadComponent: () => import('./components/public/contact/contact').then(m => m.ContactComponent) },
  { path: 'products/:id', loadComponent: () => import('./components/public/product-detail/product-detail').then(m => m.ProductDetailComponent) },
  { path: 'track/:token', loadComponent: () => import('./components/public/track-order/track-order').then(m => m.TrackOrderComponent) },
  { path: 'order-confirmed/:token', loadComponent: () => import('./components/public/thank-you/thank-you').then(m => m.ThankYouComponent) },
  { path: 'admin/login', loadComponent: () => import('./components/admin/login/login').then(m => m.AdminLoginComponent) },
  { path: 'admin/change-password', loadComponent: () => import('./components/admin/change-password/change-password').then(m => m.ChangePasswordComponent) },
  { path: 'admin/forgot-password', loadComponent: () => import('./components/admin/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent) },
  { path: 'admin/reset-password', loadComponent: () => import('./components/admin/reset-password/reset-password').then(m => m.ResetPasswordComponent) },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/layout/layout').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./components/admin/dashboard/dashboard').then(m => m.AdminDashboardComponent) },
      { path: 'products', loadComponent: () => import('./components/admin/products/products').then(m => m.AdminProductsComponent) },
      { path: 'orders', loadComponent: () => import('./components/admin/orders/orders').then(m => m.AdminOrdersComponent) },
      { path: 'riders', loadComponent: () => import('./components/admin/riders/riders').then(m => m.AdminRidersComponent) },
      { path: 'pages', loadComponent: () => import('./components/admin/pages/pages').then(m => m.AdminPagesComponent) },
      { path: 'settings', loadComponent: () => import('./components/admin/settings/settings').then(m => m.AdminSettingsComponent) },
      { path: 'users', loadComponent: () => import('./components/admin/users/users').then(m => m.AdminUsersComponent) },
      { path: 'vendor-items', loadComponent: () => import('./components/admin/vendor-items/vendor-items').then(m => m.AdminVendorItemsComponent) },
      { path: 'reviews', loadComponent: () => import('./components/admin/reviews/reviews').then(m => m.AdminReviewsComponent) },
      { path: 'audit-logs', loadComponent: () => import('./components/admin/audit-logs/audit-logs').then(m => m.AdminAuditLogsComponent) },
      { path: 'page-views', loadComponent: () => import('./components/admin/page-views/page-views').then(m => m.AdminPageViewsComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
