import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService, Agent } from '../../../services/agent.service';

@Component({
  selector: 'app-admin-agents',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h1>Agents <span class="count-badge" *ngIf="filtered.length">{{ filtered.length }}</span></h1>
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search bureau, staff…" [(ngModel)]="query" (ngModelChange)="filter()" />
        </div>
      </div>

      <div class="loading" *ngIf="loading">Loading…</div>

      <div class="table-wrap" *ngIf="!loading">
        <table class="table">
          <thead>
            <tr>
              <th>Bureau</th>
              <th>Physical Location</th>
              <th>Staff</th>
              <th>Contact</th>
              <th>Team Leader</th>
              <th>TL Contact</th>
              <th>Company</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of filtered">
              <td><strong>{{ a.bureau }}</strong></td>
              <td class="location">{{ a.physicalLocation }}</td>
              <td>{{ a.staff }}</td>
              <td><a href="tel:{{ a.contact }}">{{ a.contact }}</a></td>
              <td>{{ a.teamLeader }}</td>
              <td><a href="tel:{{ a.teamLeaderContact }}">{{ a.teamLeaderContact }}</a></td>
              <td><span class="badge">{{ a.company }}</span></td>
            </tr>
            <tr *ngIf="filtered.length === 0">
              <td colspan="7" class="empty">No agents match your search.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .section-header { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
    .section-header h1 { display: flex; align-items: center; gap: 10px; margin: 0; }
    .count-badge { font-size: 13px; font-weight: 600; background: var(--primary, #4f46e5); color: #fff; border-radius: 12px; padding: 2px 10px; }
    .search-box { display: flex; align-items: center; gap: 8px; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 8px; padding: 7px 12px; margin-left: auto; }
    .search-box input { border: none; background: transparent; outline: none; font-size: 14px; width: 220px; }
    .table-wrap { overflow-x: auto; }
    .location { max-width: 240px; white-space: normal; font-size: 13px; color: #555; }
    .empty { text-align: center; color: #999; padding: 32px !important; }
    .loading { color: #999; padding: 32px; text-align: center; }
    a[href^="tel"] { color: inherit; text-decoration: none; }
    a[href^="tel"]:hover { text-decoration: underline; }
  `]
})
export class AdminAgentsComponent implements OnInit {
  agents: Agent[] = [];
  filtered: Agent[] = [];
  query = '';
  loading = true;

  constructor(private agentService: AgentService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.agentService.getAll().subscribe(agents => {
      this.agents = agents;
      this.filtered = agents;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  filter() {
    const q = this.query.toLowerCase().trim();
    this.filtered = q
      ? this.agents.filter(a =>
          a.bureau.toLowerCase().includes(q) ||
          a.staff.toLowerCase().includes(q) ||
          a.physicalLocation.toLowerCase().includes(q) ||
          a.teamLeader.toLowerCase().includes(q)
        )
      : this.agents;
  }
}
