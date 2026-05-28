import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { NotificationService, AppNotification } from '../../../services/notification.service';
import { SettingsService } from '../../../services/settings.service';

// Permission keys mirrored from backend Authorization/Permissions.cs
const P = {
  Dashboard:        'dashboard',
  ViewOrders:       'orders.view',
  ViewProducts:     'products.view',
  ViewRiders:       'riders.view',
  ViewCouriers:     'couriers.view',
  ViewAgents:       'agents.view',
  ViewExpenses:     'expenses.view',
  ViewRevenue:      'revenue.view',
  ViewInventory:    'inventory.view',
  ViewUsers:        'users.view',
  ManagePermissions:'permissions.manage',
  ManagePages:      'pages.manage',
  ManageSettings:   'settings.manage',
  ViewVendors:      'vendors.view',
  ViewReviews:      'reviews.view',
  ViewAuditLogs:    'audit_logs.view',
  ViewPageViews:    'page_views.view',
  ViewConversions:  'conversions.view',
};

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  orders: 'Orders',
  products: 'Products',
  riders: 'Riders',
  couriers: 'Couriers',
  agents: 'Agents',
  pages: 'Pages',
  'vendor-items': 'Vendors',
  reviews: 'Reviews',
  users: 'Users',
  roles: 'Roles & Permissions',
  'audit-logs': 'Audit Logs',
  'page-views': 'Page Views',
  'conversions': 'Conversions API',
  expenses: 'Expenses',
  revenue: 'Revenue',
  inventory: 'Inventory',
  settings: 'Settings',
};

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  styles: [`
    .notif-btn { position: relative; background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #555; display: flex; align-items: center; }
    .notif-btn:hover { background: #f0f0f0; }
    .notif-badge { position: absolute; top: 2px; right: 2px; background: #e63946; color: #fff; font-size: 10px; font-weight: 800; border-radius: 10px; min-width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; padding: 0 4px; line-height: 1; }
    .notif-dropdown { position: absolute; top: calc(100% + 8px); right: 0; width: 340px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,.14); z-index: 999; overflow: hidden; }
    .notif-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; }
    .notif-header span { font-size: 13px; font-weight: 700; color: #1a1a1a; }
    .notif-mark-all { font-size: 12px; color: #4f46e5; background: none; border: none; cursor: pointer; padding: 0; }
    .notif-mark-all:hover { text-decoration: underline; }
    .notif-list { max-height: 360px; overflow-y: auto; }
    .notif-item { display: flex; gap: 10px; padding: 12px 16px; border-bottom: 1px solid #f7f7f7; cursor: default; transition: background .1s; }
    .notif-item:hover { background: #fafafa; }
    .notif-item.unread { background: #f0f4ff; }
    .notif-item.unread:hover { background: #e8eeff; }
    .notif-dot { width: 8px; height: 8px; border-radius: 50%; background: #4f46e5; flex-shrink: 0; margin-top: 5px; }
    .notif-dot.read { background: transparent; }
    .notif-body { flex: 1; min-width: 0; }
    .notif-title { font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 2px; }
    .notif-msg { font-size: 12px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-time { font-size: 11px; color: #aaa; margin-top: 3px; }
    .notif-empty { padding: 28px 16px; text-align: center; font-size: 13px; color: #aaa; }
    .topbar-right { display: flex; align-items: center; gap: 12px; position: relative; }
  `],
  template: `
    <div class="admin-layout">

      <!-- ── Sidebar ── -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {{ siteName }}
        </div>

        <nav>
          <a routerLink="/admin/dashboard" routerLinkActive="active" *ngIf="can(P.Dashboard)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </a>
          <a routerLink="/admin/orders" routerLinkActive="active" *ngIf="can(P.ViewOrders)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Orders
          </a>
          <a routerLink="/admin/products" routerLinkActive="active" *ngIf="can(P.ViewProducts)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            Products
          </a>
          <a routerLink="/admin/riders" routerLinkActive="active" *ngIf="can(P.ViewRiders)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"/>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            Riders
          </a>
          <a routerLink="/admin/couriers" routerLinkActive="active" *ngIf="can(P.ViewCouriers)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"/>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            Couriers
          </a>
          <a routerLink="/admin/agents" routerLinkActive="active" *ngIf="can(P.ViewAgents)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Agents
          </a>
          <a routerLink="/admin/pages" routerLinkActive="active" *ngIf="can(P.ManagePages)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Pages
          </a>
          <a routerLink="/admin/vendor-items" routerLinkActive="active" *ngIf="can(P.ViewVendors)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Vendors
          </a>
          <a routerLink="/admin/reviews" routerLinkActive="active" *ngIf="can(P.ViewReviews)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Reviews
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" *ngIf="can(P.ViewUsers)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Users
          </a>
          <a routerLink="/admin/roles" routerLinkActive="active" *ngIf="can(P.ManagePermissions)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Roles & Permissions
          </a>
          <a routerLink="/admin/audit-logs" routerLinkActive="active" *ngIf="can(P.ViewAuditLogs)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Audit Logs
          </a>
          <a routerLink="/admin/page-views" routerLinkActive="active" *ngIf="can(P.ViewPageViews)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Page Views
          </a>
          <a routerLink="/admin/conversions" routerLinkActive="active" *ngIf="can(P.ViewConversions)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Conversions API
          </a>
          <a routerLink="/admin/expenses" routerLinkActive="active" *ngIf="can(P.ViewExpenses)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Expenses
          </a>
          <a routerLink="/admin/revenue" routerLinkActive="active" *ngIf="can(P.ViewRevenue)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            Revenue
          </a>
          <a routerLink="/admin/inventory" routerLinkActive="active" *ngIf="can(P.ViewInventory)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            Inventory
          </a>
          <a routerLink="/admin/settings" routerLinkActive="active" *ngIf="can(P.ManageSettings)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
              <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
            </svg>
            Settings
          </a>
        </nav>

        <!-- User block -->
        <div class="sidebar-user">
          <div class="sidebar-avatar">{{ initials }}</div>
          <div class="sidebar-user-info">
            <span class="sidebar-user-name">{{ fullName || 'Admin' }}</span>
            <span class="sidebar-user-email">{{ email }}</span>
          </div>
        </div>

        <button class="logout-btn" (click)="logout()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </aside>

      <!-- ── Main content ── -->
      <div class="admin-content">

        <!-- Topbar -->
        <header class="topbar">
          <h2 class="topbar-title">{{ pageTitle }}</h2>
          <div class="topbar-right">

            <!-- Notification bell -->
            <div style="position:relative">
              <button class="notif-btn" (click)="toggleNotif($event)" title="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span class="notif-badge" *ngIf="unreadCount > 0">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
              </button>

              <div class="notif-dropdown" *ngIf="notifOpen" (click)="$event.stopPropagation()">
                <div class="notif-header">
                  <span>Notifications</span>
                  <button class="notif-mark-all" *ngIf="unreadCount > 0" (click)="markAllRead()">Mark all read</button>
                </div>
                <div class="notif-list">
                  <div *ngIf="notifications.length === 0" class="notif-empty">No notifications yet.</div>
                  <div *ngFor="let n of notifications"
                    class="notif-item" [class.unread]="!n.isRead"
                    (click)="onNotifClick(n)">
                    <div class="notif-dot" [class.read]="n.isRead"></div>
                    <div class="notif-body">
                      <div class="notif-title">{{ n.title }}</div>
                      <div class="notif-msg">{{ n.message }}</div>
                      <div class="notif-time">{{ n.createdAt | date:'dd MMM, HH:mm' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- User avatar + name -->
            <div class="topbar-user">
              <div class="topbar-avatar">{{ initials }}</div>
              <span class="topbar-name">{{ fullName || email }}</span>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main class="admin-main">
          <router-outlet />
        </main>

      </div>
    </div>
  `
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  siteName = 'Shopfront';
  pageTitle = 'Dashboard';
  fullName = '';
  email = '';
  initials = '';
  notifOpen = false;
  unreadCount = 0;
  notifications: AppNotification[] = [];
  private routerSub!: Subscription;
  private notifSub!: Subscription;
  private countSub!: Subscription;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notifService: NotificationService,
    private settings: SettingsService
  ) {}

  /** Check if current user has a permission */
  can(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }

  get P() { return P; }

  ngOnInit() {
    this.settings.getAll().subscribe(s => { this.siteName = s['site_name'] || 'Shopfront'; this.cdr.markForCheck(); });

    this.fullName = this.auth.getFullName();
    this.email = this.auth.getEmail();
    this.initials = this.toInitials(this.fullName || this.email);

    this.updateTitle(this.router.url);

    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.updateTitle(e.urlAfterRedirects ?? e.url);
      this.cdr.markForCheck();
    });

    this.notifService.startPolling();

    this.countSub = this.notifService.unreadCount$.subscribe(n => {
      this.unreadCount = n;
      this.cdr.markForCheck();
    });

    this.notifSub = this.notifService.notifications$.subscribe(items => {
      this.notifications = items;
      this.cdr.markForCheck();
    });

    document.addEventListener('click', this.closeNotif);

    // Start 1-hour inactivity auto-logout
    this.auth.startInactivityWatch();
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    this.notifSub?.unsubscribe();
    this.countSub?.unsubscribe();
    this.notifService.stopPolling();
    document.removeEventListener('click', this.closeNotif);
    this.auth.stopInactivityWatch();
  }

  toggleNotif(e: Event) {
    e.stopPropagation();
    this.notifOpen = !this.notifOpen;
    this.cdr.markForCheck();
  }

  private closeNotif = () => {
    if (this.notifOpen) { this.notifOpen = false; this.cdr.markForCheck(); }
  };

  onNotifClick(n: AppNotification) {
    if (!n.isRead) {
      n.isRead = true;
      this.notifService.markRead(n.id).subscribe();
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.cdr.markForCheck();
    }
  }

  markAllRead() {
    this.notifService.markAllRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
      this.cdr.markForCheck();
    });
  }

  private updateTitle(url: string) {
    const segment = url.split('/').filter(Boolean).pop() ?? '';
    this.pageTitle = PAGE_TITLES[segment] ?? 'Admin';
  }

  private toInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  logout() { this.auth.logout(); }
}
