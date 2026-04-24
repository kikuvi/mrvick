import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">Shopfront</div>
        <nav>
          <a routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/admin/products" routerLinkActive="active">Products</a>
          <a routerLink="/admin/orders" routerLinkActive="active">Orders</a>
          <a routerLink="/admin/riders" routerLinkActive="active">Riders</a>
          <a routerLink="/admin/pages" routerLinkActive="active">Pages</a>
          <a routerLink="/admin/users" routerLinkActive="active">Users</a>
          <a routerLink="/admin/settings" routerLinkActive="active">Settings</a>
        </nav>
        <button class="logout-btn" (click)="logout()">Logout</button>
      </aside>
      <main class="admin-main">
        <router-outlet />
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  constructor(private auth: AuthService) {}
  logout() { this.auth.logout(); }
}
