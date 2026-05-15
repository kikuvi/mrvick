import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService, Agent } from '../../../services/agent.service';

const REGIONS = ['All', 'Coastal, Mountain & Eastern', 'South & North Rift, Western', 'Nairobi'];
const PAGE_SIZE = 15;

@Component({
  selector: 'app-admin-agents',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-section">

      <!-- Header -->
      <div class="section-header">
        <h1>Agents <span class="count-badge" *ngIf="filtered.length">{{ filtered.length }}</span></h1>
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search bureau, staff…" [(ngModel)]="query" (ngModelChange)="applyFilters()" />
        </div>
      </div>

      <!-- Region tabs -->
      <div class="tabs" *ngIf="!loading">
        <button *ngFor="let r of regions"
          class="tab-btn" [class.active]="activeRegion === r"
          (click)="selectRegion(r)">
          {{ r }}
          <span class="tab-count">{{ regionCount(r) }}</span>
        </button>
      </div>

      <div class="loading" *ngIf="loading">Loading…</div>

      <ng-container *ngIf="!loading">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Bureau</th>
                <th>Physical Location</th>
                <th>Staff</th>
                <th>Contact</th>
                <th>Team Leader</th>
                <th>TL Contact</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of page; let i = index">
                <td class="row-num">{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                <td><strong>{{ a.bureau }}</strong></td>
                <td class="location">{{ a.physicalLocation }}</td>
                <td>{{ a.staff }}</td>
                <td><a href="tel:{{ a.contact }}">{{ a.contact }}</a></td>
                <td>{{ a.teamLeader }}</td>
                <td><a href="tel:{{ a.teamLeaderContact }}">{{ a.teamLeaderContact }}</a></td>
              </tr>
              <tr *ngIf="page.length === 0">
                <td colspan="7" class="empty">No agents match your search.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button class="page-btn" [disabled]="currentPage === 1" (click)="goTo(1)">«</button>
          <button class="page-btn" [disabled]="currentPage === 1" (click)="goTo(currentPage - 1)">‹</button>

          <button *ngFor="let p of pageNumbers"
            class="page-btn" [class.active]="p === currentPage"
            (click)="goTo(p)">{{ p }}</button>

          <button class="page-btn" [disabled]="currentPage === totalPages" (click)="goTo(currentPage + 1)">›</button>
          <button class="page-btn" [disabled]="currentPage === totalPages" (click)="goTo(totalPages)">»</button>

          <span class="page-info">{{ (currentPage - 1) * pageSize + 1 }}–{{ min(currentPage * pageSize, filtered.length) }} of {{ filtered.length }}</span>
        </div>
      </ng-container>

    </div>
  `,
  styles: [`
    .section-header { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
    .section-header h1 { display: flex; align-items: center; gap: 10px; margin: 0; }
    .count-badge { font-size: 13px; font-weight: 600; background: var(--primary, #4f46e5); color: #fff; border-radius: 12px; padding: 2px 10px; }
    .search-box { display: flex; align-items: center; gap: 8px; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 8px; padding: 7px 12px; margin-left: auto; }
    .search-box input { border: none; background: transparent; outline: none; font-size: 14px; width: 220px; }
    .tabs { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
    .tab-btn { display: flex; align-items: center; gap: 6px; padding: 7px 16px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fff; cursor: pointer; font-size: 13px; color: #555; transition: all .15s; }
    .tab-btn:hover { background: #f5f5f5; }
    .tab-btn.active { background: var(--primary, #4f46e5); color: #fff; border-color: var(--primary, #4f46e5); }
    .tab-count { font-size: 11px; font-weight: 700; background: rgba(0,0,0,.08); border-radius: 10px; padding: 1px 7px; }
    .tab-btn.active .tab-count { background: rgba(255,255,255,.25); color: #fff; }
    .table-wrap { overflow-x: auto; }
    .row-num { color: #aaa; font-size: 12px; width: 36px; }
    .location { max-width: 220px; white-space: normal; font-size: 13px; color: #555; }
    .empty { text-align: center; color: #999; padding: 32px !important; }
    .loading { color: #999; padding: 32px; text-align: center; }
    a[href^="tel"] { color: inherit; text-decoration: none; }
    a[href^="tel"]:hover { text-decoration: underline; }
    .pagination { display: flex; align-items: center; gap: 4px; margin-top: 20px; flex-wrap: wrap; }
    .page-btn { min-width: 36px; height: 36px; padding: 0 10px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fff; cursor: pointer; font-size: 13px; color: #444; transition: all .15s; }
    .page-btn:hover:not(:disabled) { background: #f5f5f5; border-color: #ccc; }
    .page-btn.active { background: var(--primary, #4f46e5); color: #fff; border-color: var(--primary, #4f46e5); font-weight: 600; }
    .page-btn:disabled { opacity: .4; cursor: default; }
    .page-info { margin-left: 8px; font-size: 13px; color: #888; }
  `]
})
export class AdminAgentsComponent implements OnInit {
  agents: Agent[] = [];
  filtered: Agent[] = [];
  page: Agent[] = [];
  query = '';
  activeRegion = 'All';
  loading = true;
  regions = REGIONS;

  currentPage = 1;
  pageSize = PAGE_SIZE;
  totalPages = 1;
  pageNumbers: number[] = [];

  constructor(private agentService: AgentService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.agentService.getAll().subscribe(agents => {
      this.agents = agents;
      this.applyFilters();
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  selectRegion(region: string) {
    this.activeRegion = region;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    const q = this.query.toLowerCase().trim();
    this.filtered = this.agents.filter(a => {
      const matchRegion = this.activeRegion === 'All' || a.region === this.activeRegion;
      const matchQuery = !q || (
        a.bureau.toLowerCase().includes(q) ||
        a.staff.toLowerCase().includes(q) ||
        a.physicalLocation.toLowerCase().includes(q) ||
        a.teamLeader.toLowerCase().includes(q)
      );
      return matchRegion && matchQuery;
    });
    this.currentPage = 1;
    this.buildPagination();
  }

  goTo(p: number) {
    this.currentPage = p;
    this.buildPagination();
    this.cdr.markForCheck();
  }

  private buildPagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    const start = (this.currentPage - 1) * this.pageSize;
    this.page = this.filtered.slice(start, start + this.pageSize);

    const pages: number[] = [];
    const range = 2;
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages || (i >= this.currentPage - range && i <= this.currentPage + range)) {
        pages.push(i);
      }
    }
    this.pageNumbers = pages;
  }

  regionCount(region: string): number {
    if (region === 'All') return this.agents.length;
    return this.agents.filter(a => a.region === region).length;
  }

  min(a: number, b: number) { return Math.min(a, b); }
}
