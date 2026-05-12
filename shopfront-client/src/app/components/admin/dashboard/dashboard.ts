import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  styles: [`
    .recent-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .75rem; }
    .recent-header h2 { font-size: 1rem; font-weight: 700; color: #374151; margin: 0; }
    .recent-header a { font-size: .82rem; font-weight: 700; color: #1d3557; }
    .status-dot {
      display: inline-flex; align-items: center; gap: .35rem;
      font-size: .78rem; font-weight: 700; padding: .2rem .65rem;
      border-radius: 99px;
    }
    .dot-New        { background: #dbeafe; color: #1e40af; }
    .dot-Assigned   { background: #fef3c7; color: #92400e; }
    .dot-InTransit  { background: #ede9fe; color: #5b21b6; }
    .dot-Delivered  { background: #d1fae5; color: #065f46; }
    .dot-Completed  { background: #d1fae5; color: #065f46; }
    .dot-Rejected   { background: #fee2e2; color: #991b1b; }
  `],
  template: `
    <div class="dashboard">

      <!-- Stat cards -->
      <div class="stats-grid">

        <div class="stat-card">
          <div class="stat-icon" style="background:#dbeafe;color:#2563eb">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1"/>
            </svg>
          </div>
          <div class="stat-body">
            <div class="stat-label">Total Orders</div>
            <div class="stat-value">{{ orders.length }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#fef3c7;color:#d97706">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
            </svg>
          </div>
          <div class="stat-body">
            <div class="stat-label">New</div>
            <div class="stat-value">{{ newOrders }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#ede9fe;color:#7c3aed">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"/>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <div class="stat-body">
            <div class="stat-label">In Transit</div>
            <div class="stat-value">{{ inTransit }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#d1fae5;color:#059669">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="stat-body">
            <div class="stat-label">Completed</div>
            <div class="stat-value">{{ completed }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#e0e7ff;color:#4f46e5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div class="stat-body">
            <div class="stat-label">Products</div>
            <div class="stat-value">{{ productCount }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#ccfbf1;color:#0d9488">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <div class="stat-body">
            <div class="stat-label">Total Profit</div>
            <div class="stat-value">{{ totalProfit | number:'1.0-0' }}</div>
          </div>
        </div>

      </div>

      <!-- Recent orders -->
      <div class="recent-header">
        <h2>Recent Orders</h2>
        <a routerLink="/admin/orders">View all →</a>
      </div>
      <table class="table" *ngIf="orders.length; else noOrders">
        <thead>
          <tr>
            <th>Token</th><th>Customer</th><th>Product</th>
            <th>Amount</th><th>Status</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let o of orders.slice(0, 8)">
            <td style="font-family:monospace;font-size:.8rem;font-weight:700;color:#1d3557">{{ o.trackingToken }}</td>
            <td>{{ o.customerName }}</td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ o.productTitle }}</td>
            <td style="font-weight:700">KES {{ o.priceAtOrder | number:'1.0-0' }}</td>
            <td><span class="status-dot dot-{{ o.status }}">{{ o.status }}</span></td>
            <td style="color:#888;font-size:.82rem">{{ o.createdAt | date:'dd MMM, HH:mm' }}</td>
          </tr>
        </tbody>
      </table>
      <ng-template #noOrders>
        <p class="empty">No orders yet.</p>
      </ng-template>

    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  orders: Order[] = [];
  productCount = 0;

  get newOrders()  { return this.orders.filter(o => o.status === 'New').length; }
  get inTransit()  { return this.orders.filter(o => o.status === 'InTransit').length; }
  get completed()  { return this.orders.filter(o => o.status === 'Completed').length; }
  get totalProfit(){ return this.orders.filter(o => o.status === 'Completed').reduce((s, o) => s + o.profit, 0); }

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.orderService.getAll().subscribe(o => { this.orders = o; this.cdr.markForCheck(); });
    this.productService.getAllAdmin().subscribe(p => { this.productCount = p.length; this.cdr.markForCheck(); });
  }
}
