import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService, AuditLogItem } from '../../../services/audit.service';

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  styles: [`
    .filters { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .total-label { font-size: .85rem; color: #888; }
    .pagination { display: flex; align-items: center; gap: .5rem; margin-top: 1rem; }
    .page-btn {
      padding: .35rem .75rem; border: 1px solid #ddd; border-radius: 6px;
      background: #fff; cursor: pointer; font-size: .85rem;
    }
    .page-btn:disabled { opacity: .4; cursor: default; }
    .page-btn.active { background: #1d3557; color: #fff; border-color: #1d3557; }
    .action-badge {
      display: inline-block; font-size: .75rem; font-weight: 700; border-radius: 99px;
      padding: .15rem .6rem; white-space: nowrap;
    }
    .badge-login     { background: #dbeafe; color: #1d4ed8; }
    .badge-created   { background: #dcfce7; color: #166534; }
    .badge-updated   { background: #fef9c3; color: #854d0e; }
    .badge-deleted   { background: #fee2e2; color: #991b1b; }
    .badge-status    { background: #ede9fe; color: #5b21b6; }
    .badge-archive   { background: #f3f4f6; color: #374151; }
    .badge-default   { background: #f3f4f6; color: #374151; }
    td { font-size: .85rem; }
    td.mono { font-family: monospace; font-size: .8rem; color: #555; }
  `],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h1>Audit Logs</h1>
        <span class="total-label" *ngIf="total">{{ total | number }} total entries</span>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Date / Time</th>
            <th>User</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let log of logs">
            <td class="mono">{{ log.createdAt | date:'dd MMM yyyy, HH:mm:ss' }}</td>
            <td>{{ log.userEmail || '—' }}</td>
            <td><span class="action-badge" [class]="badgeClass(log.action)">{{ log.action }}</span></td>
            <td>{{ log.entityType ? log.entityType : '—' }}</td>
            <td>{{ log.details || '—' }}</td>
          </tr>
          <tr *ngIf="!logs.length && !loading">
            <td colspan="5" class="empty">No audit logs found.</td>
          </tr>
          <tr *ngIf="loading">
            <td colspan="5" class="empty">Loading…</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination" *ngIf="totalPages > 1">
        <button class="page-btn" [disabled]="page === 1" (click)="goTo(page - 1)">← Prev</button>
        <ng-container *ngFor="let p of pageRange">
          <button class="page-btn" [class.active]="p === page" (click)="goTo(p)">{{ p }}</button>
        </ng-container>
        <button class="page-btn" [disabled]="page === totalPages" (click)="goTo(page + 1)">Next →</button>
      </div>
    </div>
  `
})
export class AdminAuditLogsComponent implements OnInit {
  logs: AuditLogItem[] = [];
  total = 0;
  page = 1;
  pageSize = 50;
  loading = false;

  get totalPages() { return Math.ceil(this.total / this.pageSize); }

  get pageRange(): number[] {
    const range: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, this.page + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  constructor(private auditService: AuditService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.cdr.markForCheck();
    this.auditService.getAll(this.page, this.pageSize).subscribe({
      next: result => {
        this.logs = result.items;
        this.total = result.total;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  goTo(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.load();
  }

  badgeClass(action: string): string {
    const a = action.toLowerCase();
    if (a === 'login') return 'action-badge badge-login';
    if (a.includes('created') || a.includes('activated')) return 'action-badge badge-created';
    if (a.includes('updated') || a.includes('changed') || a.includes('assigned')) return 'action-badge badge-updated';
    if (a.includes('deleted') || a.includes('deactivated') || a.includes('rejected')) return 'action-badge badge-deleted';
    if (a.includes('status')) return 'action-badge badge-status';
    if (a.includes('archive')) return 'action-badge badge-archive';
    return 'action-badge badge-default';
  }
}
