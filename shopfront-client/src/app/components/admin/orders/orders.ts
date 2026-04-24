import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../../services/order.service';
import { RiderService, Rider } from '../../../services/rider.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .customer-cell { cursor: pointer; }
    .customer-cell:hover strong { color: #e63946; text-decoration: underline; }

    /* ---- Customer details modal ---- */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 300; padding: 1rem;
    }
    .modal {
      background: #fff; border-radius: 12px; width: 100%; max-width: 480px;
      box-shadow: 0 12px 48px rgba(0,0,0,.22); overflow: hidden;
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.1rem 1.4rem; background: #1d3557; color: #fff;
    }
    .modal-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
    .modal-close {
      width: 30px; height: 30px; border-radius: 50%; border: none;
      background: rgba(255,255,255,.15); color: #fff; cursor: pointer;
      font-size: 1.1rem; display: flex; align-items: center; justify-content: center;
    }
    .modal-close:hover { background: rgba(255,255,255,.3); }
    .modal-body { padding: 1.4rem; display: flex; flex-direction: column; gap: .85rem; }
    .detail-row { display: grid; grid-template-columns: 130px 1fr; gap: .5rem; align-items: start; }
    .detail-label { font-size: .8rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .4px; color: #888; padding-top: .1rem; }
    .detail-value { font-size: .95rem; color: #1a1a1a; word-break: break-word; }
    .detail-value a { color: #1d3557; }
    .divider { border: none; border-top: 1px solid #f0f0f0; margin: .25rem 0; }
    .status-pill {
      display: inline-block; padding: .2rem .65rem; border-radius: 20px;
      font-size: .8rem; font-weight: 700;
    }
    .pill-New       { background:#cce5ff; color:#004085; }
    .pill-Assigned  { background:#fff3cd; color:#856404; }
    .pill-InTransit { background:#d4edda; color:#155724; }
    .pill-Delivered { background:#d4edda; color:#155724; }
    .pill-Rejected  { background:#f8d7da; color:#721c24; }
    .modal-footer { padding: .9rem 1.4rem; border-top: 1px solid #eee; text-align: right; }
  `],
  template: `
    <div class="admin-section">
      <h1>Orders</h1>

      <div class="filters">
        <select [(ngModel)]="statusFilter" name="filter">
          <option value="">All Statuses</option>
          <option>New</option><option>Assigned</option>
          <option>InTransit</option><option>Delivered</option><option>Rejected</option>
        </select>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Token</th><th>Customer</th><th>Product</th><th>County</th>
            <th>Amount</th><th>Buying</th><th>Adv.</th><th>Delivery</th><th>Profit</th>
            <th>Status</th><th>Rider</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let o of filtered">
            <td>{{ o.trackingToken }}</td>
            <td class="customer-cell" (click)="selected = o" title="View customer details">
              <strong>{{ o.customerName }}</strong><br>
              <small>{{ o.phone }}</small>
            </td>
            <td>{{ o.productTitle }}</td>
            <td>{{ o.county }}</td>
            <td>{{ o.priceAtOrder | number:'1.0-0' }}</td>
            <td>
              <input type="number" [(ngModel)]="o.buyingPrice" (blur)="saveExpenses(o)" style="width:70px" />
            </td>
            <td>
              <input type="number" [(ngModel)]="o.advertisingCost" (blur)="saveExpenses(o)" style="width:70px" />
            </td>
            <td>
              <input type="number" [(ngModel)]="o.deliveryFee" (blur)="saveExpenses(o)" style="width:70px" />
            </td>
            <td [class.positive]="o.profit > 0" [class.negative]="o.profit <= 0">
              {{ o.profit | number:'1.0-0' }}
            </td>
            <td>
              <select [(ngModel)]="o.status" (change)="updateStatus(o)">
                <option>New</option><option>Assigned</option>
                <option>InTransit</option><option>Delivered</option><option>Rejected</option>
              </select>
            </td>
            <td>
              <select [(ngModel)]="o.riderId" (change)="assignRider(o)">
                <option [ngValue]="null">— Unassigned —</option>
                <option *ngFor="let r of riders" [ngValue]="r.id">{{ r.name }}</option>
              </select>
            </td>
            <td><small>{{ o.createdAt | date:'dd/MM/yy' }}</small></td>
          </tr>
          <tr *ngIf="!filtered.length">
            <td colspan="12" style="text-align:center;color:#999;padding:2rem">No orders found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Customer Details Modal ── -->
    <div class="modal-overlay" *ngIf="selected" (click)="onOverlayClick($event)">
      <div class="modal" (click)="$event.stopPropagation()">

        <div class="modal-header">
          <h3>Customer Details</h3>
          <button class="modal-close" (click)="selected = null">×</button>
        </div>

        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">Name</span>
            <span class="detail-value">{{ selected.customerName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Phone</span>
            <span class="detail-value">
              <a href="tel:{{ selected.phone }}">{{ selected.phone }}</a>
            </span>
          </div>
          <div class="detail-row" *ngIf="selected.email">
            <span class="detail-label">Email</span>
            <span class="detail-value">
              <a href="mailto:{{ selected.email }}">{{ selected.email }}</a>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">County</span>
            <span class="detail-value">{{ selected.county }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Address</span>
            <span class="detail-value">{{ selected.deliveryAddress }}</span>
          </div>

          <hr class="divider" />

          <div class="detail-row">
            <span class="detail-label">Product</span>
            <span class="detail-value">{{ selected.productTitle }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount</span>
            <span class="detail-value">KES {{ selected.priceAtOrder | number:'1.0-0' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Buying Price</span>
            <span class="detail-value">KES {{ selected.buyingPrice | number:'1.0-0' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Profit</span>
            <span class="detail-value" [style.color]="selected.profit > 0 ? '#15803d' : '#dc2626'">
              KES {{ selected.profit | number:'1.0-0' }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tracking</span>
            <span class="detail-value" style="font-family:monospace;font-weight:700;letter-spacing:1px">
              {{ selected.trackingToken }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value">
              <span class="status-pill pill-{{ selected.status }}">{{ selected.status }}</span>
            </span>
          </div>
          <div class="detail-row" *ngIf="selected.riderName">
            <span class="detail-label">Rider</span>
            <span class="detail-value">{{ selected.riderName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Order Date</span>
            <span class="detail-value">{{ selected.createdAt | date:'dd MMM yyyy, HH:mm' }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" style="font-size:.85rem;padding:.5rem 1.25rem" (click)="selected = null">
            Close
          </button>
        </div>

      </div>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  riders: Rider[] = [];
  statusFilter = '';
  selected: Order | null = null;

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.selected = null;
  }

  get filtered() {
    return this.statusFilter ? this.orders.filter(o => o.status === this.statusFilter) : this.orders;
  }

  constructor(private orderService: OrderService, private riderService: RiderService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.orderService.getAll().subscribe(o => { this.orders = o; this.cdr.markForCheck(); });
    this.riderService.getAll().subscribe(r => { this.riders = r; this.cdr.markForCheck(); });
  }

  updateStatus(o: Order) {
    this.orderService.updateStatus(o.id, o.status).subscribe();
  }

  assignRider(o: Order) {
    if (o.riderId) this.orderService.assignRider(o.id, o.riderId).subscribe();
  }

  saveExpenses(o: Order) {
    this.orderService.updateExpenses(o.id, o.buyingPrice, o.advertisingCost, o.deliveryFee).subscribe();
  }
}
