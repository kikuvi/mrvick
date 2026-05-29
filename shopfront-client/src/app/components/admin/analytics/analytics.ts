import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AnalyticsService, HourlyAnalytics } from '../../../services/analytics.service';

Chart.register(...registerables);

const LINES = [
  { key: 'total',        label: 'All Orders',    color: '#1d3557' },
  { key: 'new',          label: 'New',            color: '#10b981' },
  { key: 'assigned',     label: 'Assigned',       color: '#f59e0b' },
  { key: 'completed',    label: 'Completed',      color: '#3b82f6' },
  { key: 'deliverLater', label: 'Deliver Later',  color: '#8b5cf6' },
  { key: 'dispatchToday',label: 'Dispatch Today', color: '#e63946' },
] as const;

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  styles: [`
    .analytics-wrap { padding: 0; }
    .chart-card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      padding: 24px;
    }
    .chart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .chart-title {
      font-size: 15px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .chart-subtitle {
      font-size: 12px;
      color: #888;
      margin-bottom: 20px;
    }
    .chart-container {
      position: relative;
      height: 320px;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 20px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #444;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .refresh-btn {
      background: none;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 12px;
      color: #555;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .refresh-btn:hover { background: #f9fafb; }
    .loading { color: #888; font-size: 14px; padding: 60px 0; text-align: center; }
    .error   { color: #e63946; font-size: 14px; padding: 60px 0; text-align: center; }
  `],
  template: `
    <div class="analytics-wrap">
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <div class="chart-title">Orders — Last 24 Hours</div>
            <div class="chart-subtitle">Order count per hour (Nairobi time)</div>
          </div>
          <button class="refresh-btn" (click)="load()" [disabled]="loading">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Refresh
          </button>
        </div>

        <div *ngIf="loading" class="loading">Loading…</div>
        <div *ngIf="error && !loading" class="error">Failed to load analytics.</div>

        <ng-container *ngIf="!loading && !error">
          <div class="chart-container">
            <canvas #chartCanvas></canvas>
          </div>
          <div class="legend">
            <div class="legend-item" *ngFor="let line of lines">
              <span class="legend-dot" [style.background]="line.color"></span>
              {{ line.label }}
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `
})
export class AdminAnalyticsComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  loading = true;
  error = false;
  lines = LINES;

  private chart: Chart | null = null;
  private data: HourlyAnalytics | null = null;

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.load(); }

  ngOnDestroy() { this.chart?.destroy(); }

  load() {
    this.loading = true;
    this.error = false;
    this.cdr.markForCheck();

    this.analyticsService.getHourly().subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
        this.error = false;
        this.cdr.markForCheck();
        // Give Angular a tick to render the canvas before drawing
        setTimeout(() => this.renderChart(), 0);
      },
      error: () => {
        this.loading = false;
        this.error = true;
        this.cdr.markForCheck();
      }
    });
  }

  private renderChart() {
    if (!this.data || !this.canvasRef) return;

    this.chart?.destroy();

    const d = this.data;
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: d.labels,
        datasets: [
          this.dataset('All Orders',    d.total,        '#1d3557'),
          this.dataset('New',           d.new,          '#10b981'),
          this.dataset('Assigned',      d.assigned,     '#f59e0b'),
          this.dataset('Completed',     d.completed,    '#3b82f6'),
          this.dataset('Deliver Later', d.deliverLater, '#8b5cf6'),
          this.dataset('Dispatch Today',d.dispatchToday,'#e63946'),
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a1a',
            titleColor: '#fff',
            bodyColor: '#ccc',
            padding: 10,
            cornerRadius: 8,
          }
        },
        scales: {
          x: {
            grid: { color: '#f0f0f0' },
            ticks: { font: { size: 11 }, color: '#888', maxRotation: 0 }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f0f0f0' },
            ticks: {
              font: { size: 11 }, color: '#888',
              stepSize: 1,
              callback: (v) => Number.isInteger(v) ? v : ''
            }
          }
        }
      }
    };

    this.chart = new Chart(this.canvasRef.nativeElement, config);
  }

  private dataset(label: string, data: number[], color: string) {
    return {
      label,
      data,
      borderColor: color,
      backgroundColor: color + '18',
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: false,
      tension: 0.3,
    };
  }
}
