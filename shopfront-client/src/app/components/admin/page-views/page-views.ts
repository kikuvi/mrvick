import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageViewService, PageViewRow } from '../../../services/page-view.service';

interface DayTotal { date: string; total: number; }
interface PathTotal { path: string; total: number; isProduct: boolean; }

@Component({
  selector: 'app-admin-page-views',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  styles: [`
    .pv-controls { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
    .pv-controls select { padding: .4rem .75rem; border: 1px solid #ddd; border-radius: 6px; font-size: .9rem; }
    .stat-cards { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .stat-card {
      flex: 1; min-width: 140px; background: #fff; border: 1px solid #e5e7eb;
      border-radius: 10px; padding: 1rem 1.25rem;
    }
    .stat-label { font-size: .78rem; color: #888; text-transform: uppercase; letter-spacing: .04em; }
    .stat-value { font-size: 1.75rem; font-weight: 700; color: #1d3557; margin-top: .2rem; }
    .section-title { font-size: .95rem; font-weight: 700; color: #374151; margin: 1.5rem 0 .6rem; }
    .product-badge {
      display: inline-block; font-size: .72rem; font-weight: 700;
      background: #dbeafe; color: #1d4ed8; border-radius: 99px; padding: .1rem .5rem; margin-left: .4rem;
    }
    td { font-size: .85rem; }
    .bar-wrap { display: flex; align-items: center; gap: .5rem; }
    .bar { height: 8px; background: #1d3557; border-radius: 4px; min-width: 2px; }
    .pagination { display: flex; align-items: center; gap: .5rem; margin-top: .75rem; font-size: .85rem; }
    .pagination button { padding: .3rem .75rem; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; cursor: pointer; font-size: .85rem; }
    .pagination button:hover:not(:disabled) { background: #f3f4f6; }
    .pagination button:disabled { opacity: .4; cursor: not-allowed; }
    .pagination span { color: #555; }
  `],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h1>Page Views</h1>
      </div>

      <div class="pv-controls">
        <label style="font-size:.85rem;font-weight:600">Period:</label>
        <select [(ngModel)]="days" (ngModelChange)="load()">
          <option [value]="7">Last 7 days</option>
          <option [value]="14">Last 14 days</option>
          <option [value]="30">Last 30 days</option>
          <option [value]="90">Last 90 days</option>
        </select>
        <span *ngIf="loading" style="font-size:.85rem;color:#888">Loading…</span>
      </div>

      <!-- Summary cards -->
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-label">Total Visits</div>
          <div class="stat-value">{{ totalVisits | number }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Product Page Visits</div>
          <div class="stat-value">{{ productVisits | number }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Unique Pages</div>
          <div class="stat-value">{{ byPath.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Days with Traffic</div>
          <div class="stat-value">{{ byDay.length }}</div>
        </div>
      </div>

      <!-- Daily totals -->
      <div class="section-title">Visits per Day</div>
      <table class="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Visits</th>
            <th style="width:40%"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of byDay">
            <td>{{ d.date | date:'EEE, dd MMM yyyy' }}</td>
            <td><strong>{{ d.total | number }}</strong></td>
            <td>
              <div class="bar-wrap">
                <div class="bar" [style.width.px]="barWidth(d.total)"></div>
                <span style="font-size:.78rem;color:#888">{{ d.total }}</span>
              </div>
            </td>
          </tr>
          <tr *ngIf="!byDay.length && !loading">
            <td colspan="3" class="empty">No data for this period.</td>
          </tr>
        </tbody>
      </table>

      <!-- Per-page breakdown -->
      <div class="section-title" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
        <span>Top Pages</span>
        <input type="text" [(ngModel)]="pathFilter" (ngModelChange)="pathPage = 1"
          placeholder="Filter by path or product ID…"
          style="padding:.35rem .75rem;border:1px solid #ddd;border-radius:6px;font-size:.85rem;min-width:260px" />
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Page</th>
            <th>Total Visits</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of pagedByPath">
            <td>
              {{ p.path }}
              <span class="product-badge" *ngIf="p.isProduct">product</span>
            </td>
            <td><strong>{{ p.total | number }}</strong></td>
          </tr>
          <tr *ngIf="!byPath.length && !loading">
            <td colspan="2" class="empty">No data for this period.</td>
          </tr>
        </tbody>
      </table>
      <div class="pagination" *ngIf="pathTotalPages > 1">
        <button (click)="pathPage = pathPage - 1" [disabled]="pathPage === 1">&#8592; Prev</button>
        <span>Page {{ pathPage }} of {{ pathTotalPages }}</span>
        <button (click)="pathPage = pathPage + 1" [disabled]="pathPage === pathTotalPages">Next &#8594;</button>
      </div>


    </div>
  `
})
export class AdminPageViewsComponent implements OnInit {
  days = 30;
  loading = false;
  rows: PageViewRow[] = [];
  pathPage = 1;
  pathFilter = '';
  readonly pathPageSize = 10;

  get totalVisits(): number { return this.rows.reduce((s, r) => s + r.count, 0); }
  get productVisits(): number { return this.rows.filter(r => r.path.startsWith('/products/')).reduce((s, r) => s + r.count, 0); }

  get byDay(): DayTotal[] {
    const map = new Map<string, number>();
    for (const r of this.rows) {
      map.set(r.date, (map.get(r.date) ?? 0) + r.count);
    }
    return Array.from(map.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  get byPath(): PathTotal[] {
    const map = new Map<string, number>();
    for (const r of this.rows) {
      map.set(r.path, (map.get(r.path) ?? 0) + r.count);
    }
    const all = Array.from(map.entries())
      .map(([path, total]) => ({ path, total, isProduct: path.startsWith('/products/') }))
      .sort((a, b) => b.total - a.total);

    const q = this.pathFilter.trim().toLowerCase();
    return q ? all.filter(p => p.path.includes(q)) : all;
  }

  get pathTotalPages(): number { return Math.ceil(this.byPath.length / this.pathPageSize) || 1; }
  get pagedByPath(): PathTotal[] {
    const start = (this.pathPage - 1) * this.pathPageSize;
    return this.byPath.slice(start, start + this.pathPageSize);
  }

  private get maxDay(): number {
    return this.byDay.reduce((m, d) => Math.max(m, d.total), 1);
  }

  barWidth(total: number): number {
    return Math.round((total / this.maxDay) * 180);
  }

  constructor(
    private svc: PageViewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.pathPage = 1;
    this.loading = true;
    this.cdr.markForCheck();
    this.svc.getReport(this.days).subscribe({
      next: data => {
        this.rows = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }
}
