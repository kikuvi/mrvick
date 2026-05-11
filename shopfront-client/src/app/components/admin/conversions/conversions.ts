import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface CoverageRow { eventName: string; pixelCount: number; capiCount: number; rate: number; }

@Component({
  selector: 'app-admin-conversions',
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
    .coverage-bar-wrap { display: flex; align-items: center; gap: .5rem; }
    .coverage-bar-bg { flex: 1; height: 10px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
    .coverage-bar-fill { height: 100%; border-radius: 4px; transition: width .3s; }
    .coverage-pct { font-size: .85rem; font-weight: 700; min-width: 42px; text-align: right; }
    .badge {
      display: inline-block; font-size: .72rem; font-weight: 700;
      border-radius: 99px; padding: .1rem .55rem;
    }
    .badge-green { background: #dcfce7; color: #16a34a; }
    .badge-amber { background: #fef3c7; color: #d97706; }
    .badge-red   { background: #fee2e2; color: #dc2626; }
    td { font-size: .85rem; }
    .empty-state { text-align: center; padding: 3rem 1rem; color: #aaa; }
    .empty-state svg { margin-bottom: .75rem; opacity: .35; }
    .empty-state p { margin: 0; font-size: .9rem; }
  `],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h1>Conversions API</h1>
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
          <div class="stat-label">Pixel Events</div>
          <div class="stat-value">{{ totalPixel | number }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">CAPI Events</div>
          <div class="stat-value">{{ totalCapi | number }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Overall Coverage</div>
          <div class="stat-value"
            [style.color]="overallRate >= 80 ? '#16a34a' : overallRate >= 50 ? '#d97706' : '#dc2626'">
            {{ overallRate | number:'1.0-0' }}%
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Event Types</div>
          <div class="stat-value">{{ coverage.length }}</div>
        </div>
      </div>

      <!-- Coverage table -->
      <div class="section-title">Event Coverage Breakdown</div>
      <p style="font-size:.82rem;color:#888;margin:0 0 .75rem">
        Each browser Pixel event should also be sent via the server-side Conversions API for better attribution.
        A shared <code>event_id</code> prevents Facebook from counting duplicates.
      </p>

      <table class="table" *ngIf="coverage.length">
        <thead>
          <tr>
            <th>Event</th>
            <th>Pixel</th>
            <th>CAPI</th>
            <th style="width:38%">Coverage</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of coverage">
            <td><strong>{{ c.eventName }}</strong></td>
            <td>{{ c.pixelCount | number }}</td>
            <td>{{ c.capiCount | number }}</td>
            <td>
              <div class="coverage-bar-wrap">
                <div class="coverage-bar-bg">
                  <div class="coverage-bar-fill"
                    [style.width.%]="c.rate"
                    [style.background]="c.rate >= 80 ? '#16a34a' : c.rate >= 50 ? '#d97706' : '#dc2626'">
                  </div>
                </div>
                <span class="coverage-pct"
                  [style.color]="c.rate >= 80 ? '#16a34a' : c.rate >= 50 ? '#d97706' : '#dc2626'">
                  {{ c.rate | number:'1.0-0' }}%
                </span>
              </div>
            </td>
            <td>
              <span class="badge"
                [class.badge-green]="c.rate >= 80"
                [class.badge-amber]="c.rate >= 50 && c.rate < 80"
                [class.badge-red]="c.rate < 50">
                {{ c.rate >= 80 ? 'Good' : c.rate >= 50 ? 'Partial' : 'Low' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="empty-state" *ngIf="!coverage.length && !loading">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1d3557" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        <p>No event data yet.<br>Coverage will appear once visitors browse products and place orders.</p>
      </div>
    </div>
  `
})
export class AdminConversionsComponent implements OnInit {
  days = 30;
  loading = false;
  coverage: CoverageRow[] = [];

  get totalPixel(): number { return this.coverage.reduce((s, c) => s + c.pixelCount, 0); }
  get totalCapi(): number  { return this.coverage.reduce((s, c) => s + c.capiCount, 0); }
  get overallRate(): number {
    return this.totalPixel > 0 ? Math.round((this.totalCapi / this.totalPixel) * 100) : 0;
  }

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.cdr.markForCheck();
    this.http.get<any[]>(`${environment.apiUrl}/pixel-events/coverage?days=${this.days}`).subscribe({
      next: data => {
        this.coverage = data.map(r => ({
          eventName:  r.eventName,
          pixelCount: r.pixelCount,
          capiCount:  r.capiCount,
          rate: r.pixelCount > 0 ? Math.round((r.capiCount / r.pixelCount) * 100) : 0
        }));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }
}
