import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../../services/order.service';
import { ExpenseService, Expense } from '../../../services/expense.service';

@Component({
  selector: 'app-admin-revenue',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="admin-section">
      <h1>Revenue</h1>

      <ng-container *ngIf="loading">
        <p class="loading-text">Loading…</p>
      </ng-container>

      <ng-container *ngIf="!loading">

        <!-- Summary cards -->
        <div class="rev-cards">
          <div class="rev-card rev-card--revenue">
            <div class="rev-card-label">Total Revenue</div>
            <div class="rev-card-value">KES {{ totalRevenue | number:'1.0-0' }}</div>
            <div class="rev-card-sub">{{ completedOrders.length }} completed order{{ completedOrders.length !== 1 ? 's' : '' }}</div>
          </div>
          <div class="rev-card rev-card--expenses">
            <div class="rev-card-label">Total Expenses</div>
            <div class="rev-card-value">KES {{ totalExpenses | number:'1.0-0' }}</div>
            <div class="rev-card-sub">From expenses records</div>
          </div>
          <div class="rev-card" [class.rev-card--profit]="netProfit >= 0" [class.rev-card--loss]="netProfit < 0">
            <div class="rev-card-label">Net Profit</div>
            <div class="rev-card-value">KES {{ netProfit | number:'1.0-0' }}</div>
            <div class="rev-card-sub">Revenue minus all costs</div>
          </div>
        </div>

        <!-- Completed orders table -->
        <h2 class="section-sub">Completed Orders</h2>

        <div *ngIf="completedOrders.length === 0" class="empty-state">
          No completed orders yet.
        </div>

        <table *ngIf="completedOrders.length > 0" class="table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Variation</th>
              <th>County</th>
              <th>Revenue</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of completedOrders">
              <td>{{ o.trackingToken }}</td>
              <td>{{ o.customerName }}</td>
              <td>{{ o.productTitle }}</td>
              <td>{{ o.variation || '—' }}</td>
              <td>{{ o.county }}</td>
              <td>{{ o.priceAtOrder | number:'1.0-0' }}</td>
              <td><small>{{ o.createdAt | date:'dd/MM/yy' }}</small></td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="totals-row">
              <td colspan="5"><strong>Totals</strong></td>
              <td><strong>{{ totalRevenue | number:'1.0-0' }}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>

      </ng-container>
    </div>
  `,
  styles: [`
    .loading-text { color: #888; padding: 2rem 0; }
    .rev-cards { display: flex; gap: 1.25rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .rev-card {
      flex: 1; min-width: 200px; background: #fff; border-radius: 12px;
      padding: 1.4rem 1.6rem; box-shadow: 0 2px 8px rgba(0,0,0,.07);
      border-top: 4px solid #e5e7eb;
    }
    .rev-card--revenue  { border-top-color: #1d3557; }
    .rev-card--expenses { border-top-color: #e63946; }
    .rev-card--profit   { border-top-color: #10b981; }
    .rev-card--loss     { border-top-color: #f59e0b; }
    .rev-card-label { font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #888; margin-bottom: .4rem; }
    .rev-card-value { font-size: 1.7rem; font-weight: 800; color: #1a1a1a; margin-bottom: .25rem; }
    .rev-card-sub   { font-size: .8rem; color: #aaa; }
    .section-sub { font-size: 1rem; font-weight: 700; color: #1a1a1a; margin: 0 0 .75rem; }
    .empty-state { color: #aaa; font-size: .95rem; padding: 1.5rem 0; }
    .totals-row td { background: #f8f9fb; font-size: .9rem; }
    .positive { color: #065f46; font-weight: 700; }
    .negative { color: #991b1b; font-weight: 700; }
  `]
})
export class AdminRevenueComponent implements OnInit {
  completedOrders: Order[] = [];
  expenses: Expense[] = [];
  loading = true;

  constructor(
    private orderService: OrderService,
    private expenseService: ExpenseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let ordersLoaded = false;
    let expensesLoaded = false;

    const done = () => {
      if (ordersLoaded && expensesLoaded) {
        this.loading = false;
        this.cdr.markForCheck();
      }
    };

    this.orderService.getAll().subscribe({
      next: orders => {
        this.completedOrders = orders.filter(o => o.status === 'Completed' && !o.isArchived);
        ordersLoaded = true;
        done();
      },
      error: () => { ordersLoaded = true; done(); }
    });

    this.expenseService.getAll().subscribe({
      next: exps => {
        this.expenses = exps;
        expensesLoaded = true;
        done();
      },
      error: () => { expensesLoaded = true; done(); }
    });
  }

  get totalRevenue()  { return this.completedOrders.reduce((s, o) => s + o.priceAtOrder, 0); }
  get totalExpenses() { return this.expenses.reduce((s, e) => s + e.amount, 0); }
  get netProfit()     { return this.totalRevenue - this.totalExpenses; }
}
