import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Orders</h3>
          <div class="stat-value">{{ orders.length }}</div>
        </div>
        <div class="stat-card">
          <h3>New Orders</h3>
          <div class="stat-value">{{ newOrders }}</div>
        </div>
        <div class="stat-card">
          <h3>Total Products</h3>
          <div class="stat-value">{{ productCount }}</div>
        </div>
        <div class="stat-card">
          <h3>Total Profit</h3>
          <div class="stat-value">KES {{ totalProfit | number:'1.0-0' }}</div>
        </div>
      </div>

      <h2>Recent Orders</h2>
      <table class="table" *ngIf="orders.length > 0">
        <thead>
          <tr>
            <th>Token</th><th>Customer</th><th>Product</th>
            <th>Amount</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let o of orders.slice(0, 10)">
            <td>{{ o.trackingToken }}</td>
            <td>{{ o.customerName }}</td>
            <td>{{ o.productTitle }}</td>
            <td>KES {{ o.priceAtOrder | number:'1.0-0' }}</td>
            <td><span class="badge badge-{{ o.status.toLowerCase() }}">{{ o.status }}</span></td>
            <td><a routerLink="/admin/orders">View</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  orders: Order[] = [];
  productCount = 0;

  get newOrders() { return this.orders.filter(o => o.status === 'New').length; }
  get totalProfit() { return this.orders.reduce((s, o) => s + o.profit, 0); }

  constructor(private orderService: OrderService, private productService: ProductService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.orderService.getAll().subscribe(o => { this.orders = o; this.cdr.markForCheck(); });
    this.productService.getAll().subscribe(p => { this.productCount = p.length; this.cdr.markForCheck(); });
  }
}
