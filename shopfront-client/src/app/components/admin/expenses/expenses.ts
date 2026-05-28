import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService, Expense, CreateExpensePayload, UpdateExpensePayload } from '../../../services/expense.service';
import { UserService, UserLookup } from '../../../services/user.service';
import { ProductService } from '../../../services/product.service';

const CATEGORIES = ['All', 'Advertising', 'Delivery', 'Operations', 'Salary', 'Rent', 'Utilities', 'Other'];
const CATEGORY_OPTIONS = ['Advertising', 'Delivery', 'Operations', 'Salary', 'Rent', 'Utilities', 'Other'];
const PAGE_SIZE = 15;

/** Returns today's date in YYYY-MM-DD using East Africa Time (UTC+3) */
const todayEAT = (): string => {
  const now = new Date();
  const eat = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  return eat.toISOString().split('T')[0];
};

const emptyForm = (): UpdateExpensePayload => ({
  name: '', amount: 0, incurredBy: '', category: '', date: todayEAT(), notes: null, status: 'Pending'
});

@Component({
  selector: 'app-admin-expenses',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-section">

      <!-- Header -->
      <div class="section-header">
        <h1>Expenses <span class="count-badge" *ngIf="filtered.length">{{ filtered.length }}</span></h1>

        <!-- Status toggle -->
        <div class="view-toggle">
          <button class="vt-btn" [class.active]="viewMode === 'all'" (click)="setView('all')">
            All <span class="vt-count">{{ expenses.length }}</span>
          </button>
          <button class="vt-btn" [class.active]="viewMode === 'Pending'" (click)="setView('Pending')">
            Pending <span class="vt-count pending-count">{{ pendingCount }}</span>
          </button>
          <button class="vt-btn" [class.active]="viewMode === 'Settled'" (click)="setView('Settled')">
            Settled <span class="vt-count settled-count">{{ settledCount }}</span>
          </button>
        </div>

        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search name, incurred by…" [(ngModel)]="query" (ngModelChange)="applyFilters()" />
        </div>
        <div class="date-filters">
          <input type="date" [(ngModel)]="dateFrom" (ngModelChange)="applyFilters()" title="From date" />
          <span class="date-sep">–</span>
          <input type="date" [(ngModel)]="dateTo" (ngModelChange)="applyFilters()" title="To date" />
          <button *ngIf="dateFrom || dateTo" class="clear-dates-btn" (click)="clearDates()" title="Clear date filter">✕</button>
        </div>
        <button class="add-btn" (click)="openAdd()">+ Add Expense</button>
      </div>

      <!-- Category tabs -->
      <div class="tabs" *ngIf="!loading">
        <button *ngFor="let c of categories"
          class="tab-btn" [class.active]="activeCategory === c"
          (click)="selectCategory(c)">
          {{ c }}
          <span class="tab-count">{{ categoryCount(c) }}</span>
        </button>
      </div>

      <!-- Totals bar -->
      <div class="totals-bar" *ngIf="!loading && filtered.length">
        <div class="total-item">
          <span class="total-label">Filtered Total</span>
          <span class="total-amount">{{ filteredTotal | number:'1.2-2' }}</span>
        </div>
        <div class="total-item">
          <span class="total-label">Pending</span>
          <span class="total-amount pending-amt">{{ pendingTotal | number:'1.2-2' }}</span>
        </div>
        <div class="total-item">
          <span class="total-label">Settled</span>
          <span class="total-amount settled-amt">{{ settledTotal | number:'1.2-2' }}</span>
        </div>
      </div>

      <div class="loading" *ngIf="loading">Loading…</div>

      <ng-container *ngIf="!loading">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Incurred By</th>
                <th>Date</th>
                <th>Notes</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of page; let i = index" [class.settled-row]="e.status === 'Settled'">
                <td class="row-num">{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                <td><strong>{{ e.name }}</strong></td>
                <td><span class="category-tag">{{ e.category }}</span></td>
                <td class="amount">{{ e.amount | number:'1.2-2' }}</td>
                <td>{{ e.incurredBy }}</td>
                <td class="date-cell">{{ e.date | date:'dd MMM yyyy' }}</td>
                <td class="notes-cell">{{ e.notes || '—' }}</td>
                <td>
                  <label class="switch" [class.busy]="toggling === e.id">
                    <input type="checkbox" [checked]="e.status === 'Settled'" (change)="toggleStatus(e)" [disabled]="toggling === e.id" />
                    <span class="slider"></span>
                  </label>
                  <span class="status-label" [class.settled]="e.status === 'Settled'">{{ e.status }}</span>
                </td>
                <td class="actions-cell">
                  <button class="edit-btn" (click)="openEdit(e)">Edit</button>
                  <button class="del-btn" (click)="confirmDelete(e)" [disabled]="deleting === e.id">
                    {{ deleting === e.id ? '…' : 'Del' }}
                  </button>
                </td>
              </tr>
              <tr *ngIf="page.length === 0">
                <td colspan="9" class="empty">No expenses match your filters.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button class="page-btn" [disabled]="currentPage === 1" (click)="goTo(1)">«</button>
          <button class="page-btn" [disabled]="currentPage === 1" (click)="goTo(currentPage - 1)">‹</button>
          <button *ngFor="let p of pageNumbers" class="page-btn" [class.active]="p === currentPage" (click)="goTo(p)">{{ p }}</button>
          <button class="page-btn" [disabled]="currentPage === totalPages" (click)="goTo(currentPage + 1)">›</button>
          <button class="page-btn" [disabled]="currentPage === totalPages" (click)="goTo(totalPages)">»</button>
          <span class="page-info">{{ (currentPage - 1) * pageSize + 1 }}–{{ min(currentPage * pageSize, filtered.length) }} of {{ filtered.length }}</span>
        </div>
      </ng-container>

      <!-- Add / Edit Modal -->
      <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingId ? 'Edit Expense' : 'Add Expense' }}</h2>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>
          <form class="modal-form" #expenseForm="ngForm" (ngSubmit)="submitExpense(expenseForm)">
            <div class="form-group">
              <label>Name <span class="req">*</span></label>
              <input type="text" [(ngModel)]="form.name" name="name" required placeholder="e.g. Facebook Ads – May" list="product-names-list" autocomplete="off" />
              <datalist id="product-names-list">
                <option *ngFor="let p of productNames" [value]="p"></option>
              </datalist>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Amount (KES) <span class="req">*</span></label>
                <input type="number" [(ngModel)]="form.amount" name="amount" required min="0.01" step="0.01" placeholder="0.00" />
              </div>
              <div class="form-group">
                <label>Category <span class="req">*</span></label>
                <select [(ngModel)]="form.category" name="category" required>
                  <option value="">Select category…</option>
                  <option *ngFor="let c of categoryOptions" [value]="c">{{ c }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Incurred By <span class="req">*</span></label>
                <select [(ngModel)]="form.incurredBy" name="incurredBy" required [disabled]="usersLoading">
                  <option value="">{{ usersLoading ? 'Loading…' : 'Select user…' }}</option>
                  <option *ngFor="let u of users" [value]="u.fullName">{{ u.fullName }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Date <span class="req">*</span></label>
                <input type="date" [(ngModel)]="form.date" name="date" required />
              </div>
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea [(ngModel)]="form.notes" name="notes" rows="2" placeholder="Optional details…"></textarea>
            </div>
            <div class="form-group form-group--switch" *ngIf="editingId">
              <label>Status</label>
              <div class="status-toggle">
                <label class="switch">
                  <input type="checkbox" [checked]="form.status === 'Settled'" (change)="toggleFormStatus()" name="statusToggle" />
                  <span class="slider"></span>
                </label>
                <span class="status-label" [class.settled]="form.status === 'Settled'">{{ form.status }}</span>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="cancel-btn" (click)="closeModal()">Cancel</button>
              <button type="submit" class="submit-btn" [disabled]="saving || expenseForm.invalid || !form.incurredBy">
                {{ saving ? 'Saving…' : (editingId ? 'Save Changes' : 'Add Expense') }}
              </button>
            </div>
            <p class="form-error" *ngIf="saveError">{{ saveError }}</p>
          </form>
        </div>
      </div>

      <!-- Delete confirmation -->
      <div class="modal-backdrop" *ngIf="deleteTarget" (click)="cancelDelete()">
        <div class="modal confirm-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Delete Expense</h2>
            <button class="close-btn" (click)="cancelDelete()">✕</button>
          </div>
          <div class="confirm-body">
            <p>Delete <strong>{{ deleteTarget?.name }}</strong>?</p>
            <p class="confirm-sub">This cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" (click)="cancelDelete()">Cancel</button>
            <button class="delete-confirm-btn" (click)="doDelete()" [disabled]="deleting !== null">
              {{ deleting ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
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
    .pending-count { background: rgba(234,179,8,.18); color: #92400e; }
    .settled-count { background: rgba(22,163,74,.15); color: #15803d; }
    .vt-btn.active .pending-count, .vt-btn.active .settled-count { background: rgba(255,255,255,.25); color: #fff; }
    .search-box { display: flex; align-items: center; gap: 8px; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 8px; padding: 7px 12px; flex: 1; max-width: 280px; }
    .search-box input { border: none; background: transparent; outline: none; font-size: 14px; width: 100%; }
    .date-filters { display: flex; align-items: center; gap: 6px; }
    .date-filters input[type=date] { border: 1px solid #e0e0e0; border-radius: 8px; padding: 6px 10px; font-size: 13px; background: #f5f5f5; color: #333; outline: none; }
    .date-filters input[type=date]:focus { border-color: #1d3557; background: #fff; }
    .date-sep { font-size: 13px; color: #aaa; }
    .clear-dates-btn { background: none; border: none; cursor: pointer; color: #aaa; font-size: 14px; padding: 2px 4px; border-radius: 4px; line-height: 1; }
    .clear-dates-btn:hover { color: #e63946; background: #fee2e2; }
    .add-btn { margin-left: auto; padding: 8px 18px; background: var(--primary, #4f46e5); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .add-btn:hover { opacity: .88; }
    .tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
    .tab-btn { display: flex; align-items: center; gap: 6px; padding: 7px 16px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fff; cursor: pointer; font-size: 13px; color: #555; transition: all .15s; }
    .tab-btn:hover { background: #f5f5f5; }
    .tab-btn.active { background: var(--primary, #4f46e5); color: #fff; border-color: var(--primary, #4f46e5); }
    .tab-count { font-size: 11px; font-weight: 700; background: rgba(0,0,0,.08); border-radius: 10px; padding: 1px 7px; }
    .tab-btn.active .tab-count { background: rgba(255,255,255,.25); color: #fff; }
    .totals-bar { display: flex; gap: 24px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 20px; margin-bottom: 20px; flex-wrap: wrap; }
    .total-item { display: flex; flex-direction: column; gap: 2px; }
    .total-label { font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: .05em; }
    .total-amount { font-size: 18px; font-weight: 700; color: #1a1a1a; }
    .pending-amt { color: #b45309; }
    .settled-amt { color: #15803d; }
    .loading { color: #999; padding: 32px; text-align: center; }
    .table-wrap { overflow-x: auto; }
    .row-num { color: #aaa; font-size: 12px; width: 36px; }
    .category-tag { display: inline-block; padding: 2px 8px; border-radius: 10px; background: #f0f0f0; font-size: 12px; color: #555; }
    .amount { font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .date-cell { white-space: nowrap; font-size: 13px; color: #555; }
    .notes-cell { max-width: 200px; font-size: 12px; color: #777; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .settled-row td:first-child { border-left: 3px solid #16a34a; }
    .switch { position: relative; display: inline-block; width: 36px; height: 20px; cursor: pointer; vertical-align: middle; }
    .switch.busy { opacity: .5; cursor: default; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; inset: 0; background: #d1d5db; border-radius: 20px; transition: .2s; }
    .slider:before { content: ''; position: absolute; height: 14px; width: 14px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: .2s; }
    input:checked + .slider { background: #16a34a; }
    input:checked + .slider:before { transform: translateX(16px); }
    .status-label { font-size: 12px; color: #999; margin-left: 6px; vertical-align: middle; }
    .status-label.settled { color: #15803d; }
    .actions-cell { display: flex; gap: 6px; white-space: nowrap; }
    .edit-btn { padding: 4px 10px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; font-size: 12px; cursor: pointer; color: #444; }
    .edit-btn:hover { background: #f5f5f5; }
    .del-btn { padding: 4px 10px; border: 1px solid #fca5a5; border-radius: 6px; background: #fff; font-size: 12px; cursor: pointer; color: #dc2626; }
    .del-btn:hover:not(:disabled) { background: #fef2f2; }
    .del-btn:disabled { opacity: .4; cursor: default; }
    .empty { text-align: center; color: #999; padding: 32px !important; }
    .pagination { display: flex; align-items: center; gap: 4px; margin-top: 20px; flex-wrap: wrap; }
    .page-btn { min-width: 36px; height: 36px; padding: 0 10px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fff; cursor: pointer; font-size: 13px; color: #444; transition: all .15s; }
    .page-btn:hover:not(:disabled) { background: #f5f5f5; }
    .page-btn.active { background: var(--primary, #4f46e5); color: #fff; border-color: var(--primary, #4f46e5); font-weight: 600; }
    .page-btn:disabled { opacity: .4; cursor: default; }
    .page-info { margin-left: 8px; font-size: 13px; color: #888; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal { background: #fff; border-radius: 12px; width: 100%; max-width: 520px; box-shadow: 0 8px 40px rgba(0,0,0,.18); max-height: 90vh; overflow-y: auto; }
    .confirm-modal { max-width: 380px; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
    .modal-header h2 { margin: 0; font-size: 18px; }
    .close-btn { background: none; border: none; font-size: 18px; cursor: pointer; color: #888; line-height: 1; padding: 4px; }
    .close-btn:hover { color: #333; }
    .modal-form { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 14px; }
    .confirm-body { padding: 16px 24px; }
    .confirm-body p { margin: 0 0 4px; font-size: 15px; }
    .confirm-sub { font-size: 13px; color: #999; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-group--switch { flex-direction: row; align-items: center; gap: 10px; }
    .status-toggle { display: flex; align-items: center; }
    .form-group label { font-size: 13px; font-weight: 600; color: #444; }
    .req { color: #e53e3e; }
    .form-group input, .form-group select, .form-group textarea { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 7px; font-size: 14px; outline: none; background: #fff; font-family: inherit; resize: vertical; }
    .form-group select { cursor: pointer; }
    .form-group select:disabled { opacity: .6; cursor: default; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--primary, #4f46e5); box-shadow: 0 0 0 2px rgba(79,70,229,.12); }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 0 24px 24px; margin-top: 4px; }
    .modal-form .modal-footer { padding: 0; }
    .cancel-btn { padding: 8px 18px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; font-size: 14px; cursor: pointer; color: #555; }
    .cancel-btn:hover { background: #f5f5f5; }
    .submit-btn { padding: 8px 22px; background: var(--primary, #4f46e5); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .submit-btn:disabled { opacity: .55; cursor: default; }
    .submit-btn:not(:disabled):hover { opacity: .88; }
    .delete-confirm-btn { padding: 8px 22px; background: #dc2626; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .delete-confirm-btn:disabled { opacity: .55; cursor: default; }
    .delete-confirm-btn:not(:disabled):hover { opacity: .88; }
    .form-error { color: #e53e3e; font-size: 13px; margin: 0; text-align: right; }
  `]
})
export class AdminExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  filtered: Expense[] = [];
  page: Expense[] = [];
  query = '';
  dateFrom = '';
  dateTo = '';
  activeCategory = 'All';
  viewMode: 'all' | 'Pending' | 'Settled' = 'all';
  loading = true;
  categories = CATEGORIES;
  categoryOptions = CATEGORY_OPTIONS;

  /** Users loaded for the "Incurred By" dropdown */
  users: UserLookup[] = [];
  usersLoading = false;

  /** Product titles for the Name autocomplete */
  productNames: string[] = [];

  currentPage = 1;
  pageSize = PAGE_SIZE;
  totalPages = 1;
  pageNumbers: number[] = [];

  showModal = false;
  editingId: string | null = null;
  saving = false;
  saveError = '';
  form: UpdateExpensePayload = emptyForm();

  toggling: string | null = null;
  deleting: string | null = null;
  deleteTarget: Expense | null = null;

  constructor(
    private expenseService: ExpenseService,
    private userService: UserService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Load expenses
    this.expenseService.getAll().subscribe({
      next: expenses => {
        this.expenses = expenses;
        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    // Load product titles for the Name autocomplete
    this.productService.getAllAdmin().subscribe({
      next: products => {
        this.productNames = products.map(p => p.title).sort();
        this.cdr.markForCheck();
      },
      error: () => {}
    });

    // Load users for the "Incurred By" dropdown
    this.usersLoading = true;
    this.userService.lookup().subscribe({
      next: users => {
        this.users = users;
        this.usersLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.usersLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get pendingCount() { return this.expenses.filter(e => e.status === 'Pending').length; }
  get settledCount() { return this.expenses.filter(e => e.status === 'Settled').length; }

  get filteredTotal() { return this.filtered.reduce((s, e) => s + e.amount, 0); }
  get pendingTotal() { return this.filtered.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0); }
  get settledTotal() { return this.filtered.filter(e => e.status === 'Settled').reduce((s, e) => s + e.amount, 0); }

  setView(mode: 'all' | 'Pending' | 'Settled') {
    this.viewMode = mode;
    this.currentPage = 1;
    this.applyFilters();
  }

  selectCategory(cat: string) {
    this.activeCategory = cat;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    const q = this.query.toLowerCase().trim();
    this.filtered = this.expenses.filter(e => {
      const matchView = this.viewMode === 'all' || e.status === this.viewMode;
      const matchCat = this.activeCategory === 'All' || e.category === this.activeCategory;
      const matchQuery = !q || e.name.toLowerCase().includes(q) || e.incurredBy.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      const matchFrom = !this.dateFrom || e.date.slice(0, 10) >= this.dateFrom;
      const matchTo   = !this.dateTo   || e.date.slice(0, 10) <= this.dateTo;
      return matchView && matchCat && matchQuery && matchFrom && matchTo;
    });
    this.currentPage = 1;
    this.buildPagination();
    this.cdr.markForCheck();
  }

  clearDates() {
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }

  categoryCount(cat: string): number {
    const q = this.query.toLowerCase().trim();
    let base = this.viewMode === 'all' ? this.expenses : this.expenses.filter(e => e.status === this.viewMode);
    if (q) base = base.filter(e => e.name.toLowerCase().includes(q) || e.incurredBy.toLowerCase().includes(q));
    if (this.dateFrom) base = base.filter(e => e.date.slice(0, 10) >= this.dateFrom);
    if (this.dateTo)   base = base.filter(e => e.date.slice(0, 10) <= this.dateTo);
    if (cat === 'All') return base.length;
    return base.filter(e => e.category === cat).length;
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
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
        pages.push(i);
      }
    }
    this.pageNumbers = pages;
  }

  toggleStatus(expense: Expense) {
    if (this.toggling) return;
    this.toggling = expense.id;
    const newStatus = expense.status === 'Pending' ? 'Settled' : 'Pending';
    this.expenseService.updateStatus(expense.id, newStatus).subscribe({
      next: res => {
        this.expenses = this.expenses.map(e => e.id === res.id ? { ...e, status: res.status as 'Pending' | 'Settled' } : e);
        this.applyFilters();
        this.toggling = null;
        this.cdr.markForCheck();
      },
      error: () => { this.toggling = null; this.cdr.markForCheck(); }
    });
  }

  toggleFormStatus() {
    this.form.status = this.form.status === 'Pending' ? 'Settled' : 'Pending';
  }

  openAdd() {
    this.editingId = null;
    this.form = emptyForm();
    this.saveError = '';
    this.showModal = true;
  }

  openEdit(expense: Expense) {
    this.editingId = expense.id;
    this.form = {
      name: expense.name,
      amount: expense.amount,
      incurredBy: expense.incurredBy,
      category: expense.category,
      date: expense.date.split('T')[0],
      notes: expense.notes,
      status: expense.status
    };
    this.saveError = '';
    this.showModal = true;
  }

  closeModal() {
    if (this.saving) return;
    this.showModal = false;
    this.editingId = null;
  }

  submitExpense(formRef: any) {
    if (formRef.invalid || !this.form.incurredBy) return;
    this.saving = true;
    this.saveError = '';

    if (this.editingId) {
      this.expenseService.update(this.editingId, this.form).subscribe({
        next: updated => {
          this.expenses = this.expenses.map(e => e.id === updated.id ? updated : e);
          this.applyFilters();
          this.saving = false;
          this.showModal = false;
          this.editingId = null;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.saveError = `Failed to save changes. (${err?.status ?? 'Network error'})`;
          this.saving = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.expenseService.create(this.form).subscribe({
        next: expense => {
          this.expenses = [expense, ...this.expenses];
          this.applyFilters();
          this.saving = false;
          this.showModal = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.saveError = `Failed to add expense. (${err?.status ?? 'Network error'})`;
          this.saving = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  confirmDelete(expense: Expense) {
    this.deleteTarget = expense;
  }

  cancelDelete() {
    if (this.deleting) return;
    this.deleteTarget = null;
  }

  doDelete() {
    if (!this.deleteTarget || this.deleting) return;
    this.deleting = this.deleteTarget.id;
    this.expenseService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.expenses = this.expenses.filter(e => e.id !== this.deleteTarget!.id);
        this.applyFilters();
        this.deleting = null;
        this.deleteTarget = null;
        this.cdr.markForCheck();
      },
      error: () => { this.deleting = null; this.cdr.markForCheck(); }
    });
  }

  min(a: number, b: number) { return Math.min(a, b); }
}
