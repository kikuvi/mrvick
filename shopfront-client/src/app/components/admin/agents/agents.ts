import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService, Agent, CreateAgentPayload, UpdateAgentPayload } from '../../../services/agent.service';

const REGIONS = ['All', 'Coastal, Mountain & Eastern', 'South & North Rift, Western', 'Nairobi'];
const REGION_OPTIONS = ['Coastal, Mountain & Eastern', 'South & North Rift, Western', 'Nairobi'];
const PAGE_SIZE = 10;

const emptyForm = (): UpdateAgentPayload => ({
  bureau: '', physicalLocation: '', staff: '', contact: '',
  teamLeader: '', teamLeaderContact: '', company: 'Standard', region: '', confirmed: false
});

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

        <!-- All / Confirmed view toggle -->
        <div class="view-toggle">
          <button class="vt-btn" [class.active]="viewMode === 'all'" (click)="setView('all')">
            All <span class="vt-count">{{ agents.length }}</span>
          </button>
          <button class="vt-btn" [class.active]="viewMode === 'confirmed'" (click)="setView('confirmed')">
            Confirmed <span class="vt-count confirmed-count">{{ confirmedCount }}</span>
          </button>
        </div>

        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search bureau, staff…" [(ngModel)]="query" (ngModelChange)="applyFilters()" />
        </div>
        <button class="add-btn" (click)="openAdd()">+ Add Agent</button>
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
                <th>Confirmed</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of page; let i = index" [class.confirmed-row]="a.confirmed">
                <td class="row-num">{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                <td><strong>{{ a.bureau }}</strong></td>
                <td class="location">{{ a.physicalLocation }}</td>
                <td>{{ a.staff }}</td>
                <td><a href="tel:{{ a.contact }}">{{ a.contact }}</a></td>
                <td>{{ a.teamLeader }}</td>
                <td><a href="tel:{{ a.teamLeaderContact }}">{{ a.teamLeaderContact }}</a></td>
                <td>
                  <label class="switch" [class.busy]="toggling === a.id">
                    <input type="checkbox" [checked]="a.confirmed" (change)="toggleConfirmed(a)" [disabled]="toggling === a.id" />
                    <span class="slider"></span>
                  </label>
                </td>
                <td>
                  <button class="edit-btn" (click)="openEdit(a)">Edit</button>
                </td>
              </tr>
              <tr *ngIf="page.length === 0">
                <td colspan="9" class="empty">No agents match your search.</td>
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

      <!-- Add / Edit Modal -->
      <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingId ? 'Edit Agent' : 'Add Agent' }}</h2>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>
          <form class="modal-form" (ngSubmit)="submitAgent()">
            <div class="form-row">
              <div class="form-group">
                <label>Bureau <span class="req">*</span></label>
                <input type="text" [(ngModel)]="form.bureau" name="bureau" required placeholder="e.g. Mombasa Bureau" />
              </div>
              <div class="form-group">
                <label>Region <span class="req">*</span></label>
                <select [(ngModel)]="form.region" name="region" required>
                  <option value="">Select region…</option>
                  <option *ngFor="let r of regionOptions" [value]="r">{{ r }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Physical Location</label>
              <input type="text" [(ngModel)]="form.physicalLocation" name="physicalLocation" placeholder="e.g. Moi Avenue, Mombasa" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Staff</label>
                <input type="text" [(ngModel)]="form.staff" name="staff" placeholder="Staff name" />
              </div>
              <div class="form-group">
                <label>Contact</label>
                <input type="tel" [(ngModel)]="form.contact" name="contact" placeholder="07xxxxxxxx" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Team Leader</label>
                <input type="text" [(ngModel)]="form.teamLeader" name="teamLeader" placeholder="Team leader name" />
              </div>
              <div class="form-group">
                <label>TL Contact</label>
                <input type="tel" [(ngModel)]="form.teamLeaderContact" name="teamLeaderContact" placeholder="07xxxxxxxx" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Company</label>
                <input type="text" [(ngModel)]="form.company" name="company" placeholder="Standard" />
              </div>
              <div class="form-group form-group--switch" *ngIf="editingId">
                <label>Confirmed</label>
                <label class="switch">
                  <input type="checkbox" [(ngModel)]="form.confirmed" name="confirmed" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="cancel-btn" (click)="closeModal()">Cancel</button>
              <button type="submit" class="submit-btn" [disabled]="saving || !form.bureau || !form.region">
                {{ saving ? 'Saving…' : (editingId ? 'Save Changes' : 'Add Agent') }}
              </button>
            </div>
            <p class="form-error" *ngIf="saveError">{{ saveError }}</p>
          </form>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .section-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
    .section-header h1 { display: flex; align-items: center; gap: 10px; margin: 0; }
    .count-badge { font-size: 13px; font-weight: 600; background: var(--primary, #4f46e5); color: #fff; border-radius: 12px; padding: 2px 10px; }
    .view-toggle { display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    .vt-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border: none; background: #fff; cursor: pointer; font-size: 13px; color: #555; transition: all .15s; }
    .vt-btn + .vt-btn { border-left: 1px solid #e0e0e0; }
    .vt-btn:hover { background: #f5f5f5; }
    .vt-btn.active { background: var(--primary, #4f46e5); color: #fff; }
    .vt-count { font-size: 11px; font-weight: 700; background: rgba(0,0,0,.1); border-radius: 10px; padding: 1px 6px; }
    .vt-btn.active .vt-count { background: rgba(255,255,255,.25); }
    .confirmed-count { background: rgba(22,163,74,.15); color: #15803d; }
    .vt-btn.active .confirmed-count { background: rgba(255,255,255,.25); color: #fff; }
    .search-box { display: flex; align-items: center; gap: 8px; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 8px; padding: 7px 12px; flex: 1; max-width: 260px; }
    .search-box input { border: none; background: transparent; outline: none; font-size: 14px; width: 100%; }
    .add-btn { margin-left: auto; padding: 8px 18px; background: var(--primary, #4f46e5); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .add-btn:hover { opacity: .88; }
    .tabs { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
    .tab-btn { display: flex; align-items: center; gap: 6px; padding: 7px 16px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fff; cursor: pointer; font-size: 13px; color: #555; transition: all .15s; }
    .tab-btn:hover { background: #f5f5f5; }
    .tab-btn.active { background: var(--primary, #4f46e5); color: #fff; border-color: var(--primary, #4f46e5); }
    .tab-count { font-size: 11px; font-weight: 700; background: rgba(0,0,0,.08); border-radius: 10px; padding: 1px 7px; }
    .tab-btn.active .tab-count { background: rgba(255,255,255,.25); color: #fff; }
    .table-wrap { overflow-x: auto; }
    .row-num { color: #aaa; font-size: 12px; width: 36px; }
    .location { max-width: 200px; white-space: normal; font-size: 13px; color: #555; }
    .confirmed-row td:first-child { border-left: 3px solid #16a34a; }
    .empty { text-align: center; color: #999; padding: 32px !important; }
    .loading { color: #999; padding: 32px; text-align: center; }
    a[href^="tel"] { color: inherit; text-decoration: none; }
    a[href^="tel"]:hover { text-decoration: underline; }
    .switch { position: relative; display: inline-block; width: 40px; height: 22px; cursor: pointer; }
    .switch.busy { opacity: .5; cursor: default; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; inset: 0; background: #d1d5db; border-radius: 22px; transition: .2s; }
    .slider:before { content: ''; position: absolute; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: .2s; }
    input:checked + .slider { background: #16a34a; }
    input:checked + .slider:before { transform: translateX(18px); }
    .edit-btn { padding: 4px 12px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; font-size: 12px; cursor: pointer; color: #444; white-space: nowrap; }
    .edit-btn:hover { background: #f5f5f5; }
    .pagination { display: flex; align-items: center; gap: 4px; margin-top: 20px; flex-wrap: wrap; }
    .page-btn { min-width: 36px; height: 36px; padding: 0 10px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fff; cursor: pointer; font-size: 13px; color: #444; transition: all .15s; }
    .page-btn:hover:not(:disabled) { background: #f5f5f5; border-color: #ccc; }
    .page-btn.active { background: var(--primary, #4f46e5); color: #fff; border-color: var(--primary, #4f46e5); font-weight: 600; }
    .page-btn:disabled { opacity: .4; cursor: default; }
    .page-info { margin-left: 8px; font-size: 13px; color: #888; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal { background: #fff; border-radius: 12px; width: 100%; max-width: 560px; box-shadow: 0 8px 40px rgba(0,0,0,.18); max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
    .modal-header h2 { margin: 0; font-size: 18px; }
    .close-btn { background: none; border: none; font-size: 18px; cursor: pointer; color: #888; line-height: 1; padding: 4px; }
    .close-btn:hover { color: #333; }
    .modal-form { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 14px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-group--switch { justify-content: center; }
    .form-group label { font-size: 13px; font-weight: 600; color: #444; }
    .req { color: #e53e3e; }
    .form-group input[type="text"], .form-group input[type="tel"], .form-group select { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 7px; font-size: 14px; outline: none; background: #fff; }
    .form-group input:focus, .form-group select:focus { border-color: var(--primary, #4f46e5); box-shadow: 0 0 0 2px rgba(79,70,229,.12); }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
    .cancel-btn { padding: 8px 18px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; font-size: 14px; cursor: pointer; color: #555; }
    .cancel-btn:hover { background: #f5f5f5; }
    .submit-btn { padding: 8px 22px; background: var(--primary, #4f46e5); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .submit-btn:disabled { opacity: .55; cursor: default; }
    .submit-btn:not(:disabled):hover { opacity: .88; }
    .form-error { color: #e53e3e; font-size: 13px; margin: 0; text-align: right; }
  `]
})
export class AdminAgentsComponent implements OnInit {
  agents: Agent[] = [];
  filtered: Agent[] = [];
  page: Agent[] = [];
  query = '';
  activeRegion = 'All';
  viewMode: 'all' | 'confirmed' = 'all';
  loading = true;
  regions = REGIONS;
  regionOptions = REGION_OPTIONS;

  currentPage = 1;
  pageSize = PAGE_SIZE;
  totalPages = 1;
  pageNumbers: number[] = [];

  showModal = false;
  editingId: string | null = null;
  saving = false;
  saveError = '';
  form: UpdateAgentPayload = emptyForm();

  toggling: string | null = null;

  constructor(private agentService: AgentService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.agentService.getAll().subscribe(agents => {
      this.agents = agents;
      this.applyFilters();
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  get confirmedCount() { return this.agents.filter(a => a.confirmed).length; }

  setView(mode: 'all' | 'confirmed') {
    this.viewMode = mode;
    this.currentPage = 1;
    this.applyFilters();
  }

  selectRegion(region: string) {
    this.activeRegion = region;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    const q = this.query.toLowerCase().trim();
    this.filtered = this.agents.filter(a => {
      const matchView = this.viewMode === 'all' || a.confirmed;
      const matchRegion = this.activeRegion === 'All' || a.region === this.activeRegion;
      const matchQuery = !q || (
        a.bureau.toLowerCase().includes(q) ||
        a.staff.toLowerCase().includes(q) ||
        a.physicalLocation.toLowerCase().includes(q) ||
        a.teamLeader.toLowerCase().includes(q)
      );
      return matchView && matchRegion && matchQuery;
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
    const base = this.viewMode === 'all' ? this.agents : this.agents.filter(a => a.confirmed);
    if (region === 'All') return base.length;
    return base.filter(a => a.region === region).length;
  }

  toggleConfirmed(agent: Agent) {
    if (this.toggling) return;
    this.toggling = agent.id;
    this.agentService.toggleConfirmed(agent.id).subscribe({
      next: res => {
        this.agents = this.agents.map(a => a.id === res.id ? { ...a, confirmed: res.confirmed } : a);
        this.applyFilters();
        this.toggling = null;
        this.cdr.markForCheck();
      },
      error: () => { this.toggling = null; this.cdr.markForCheck(); }
    });
  }

  openAdd() {
    this.editingId = null;
    this.form = emptyForm();
    this.saveError = '';
    this.showModal = true;
  }

  openEdit(agent: Agent) {
    this.editingId = agent.id;
    this.form = {
      bureau: agent.bureau,
      physicalLocation: agent.physicalLocation,
      staff: agent.staff,
      contact: agent.contact,
      teamLeader: agent.teamLeader,
      teamLeaderContact: agent.teamLeaderContact,
      company: agent.company,
      region: agent.region,
      confirmed: agent.confirmed
    };
    this.saveError = '';
    this.showModal = true;
  }

  closeModal() {
    if (this.saving) return;
    this.showModal = false;
    this.editingId = null;
  }

  submitAgent() {
    if (!this.form.bureau.trim() || !this.form.region) return;
    this.saving = true;
    this.saveError = '';

    if (this.editingId) {
      this.agentService.update(this.editingId, this.form).subscribe({
        next: updated => {
          this.agents = this.agents.map(a => a.id === updated.id ? updated : a)
            .sort((a, b) => a.bureau.localeCompare(b.bureau));
          this.applyFilters();
          this.saving = false;
          this.showModal = false;
          this.editingId = null;
          this.cdr.markForCheck();
        },
        error: () => {
          this.saveError = 'Failed to save changes. Please try again.';
          this.saving = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.agentService.create(this.form).subscribe({
        next: agent => {
          this.agents = [...this.agents, agent].sort((a, b) => a.bureau.localeCompare(b.bureau));
          this.applyFilters();
          this.saving = false;
          this.showModal = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.saveError = 'Failed to save agent. Please try again.';
          this.saving = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  min(a: number, b: number) { return Math.min(a, b); }
}
