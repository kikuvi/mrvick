import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order, OrderNote } from '../../../services/order.service';
import { RiderService, Rider } from '../../../services/rider.service';
import { CourierService, Courier } from '../../../services/courier.service';
import { UserService, AdminUser } from '../../../services/user.service';

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
    .pill-New          { background:#cce5ff; color:#004085; }
    .pill-Assigned     { background:#fff3cd; color:#856404; }
    .pill-InTransit    { background:#d4edda; color:#155724; }
    .pill-Delivered    { background:#d4edda; color:#155724; }
    .pill-Completed    { background:#d1fae5; color:#065f46; }
    .pill-Rejected     { background:#f8d7da; color:#721c24; }
    .pill-DeliverLater    { background:#fef3c7; color:#92400e; }
    .pill-DispatchToday   { background:#fed7aa; color:#9a3412; }
    .pill-InInventory     { background:#ede9fe; color:#5b21b6; }
    .modal-footer { padding: .9rem 1.4rem; border-top: 1px solid #eee; text-align: right; }

    /* ---- Deliver Later banner ---- */
    .delivery-due-row td { border-top: 2px solid #dc2626 !important; }
    .delivery-banner-row td { padding: 0 !important; border-bottom: 2px solid #dc2626; }
    .delivery-due-banner {
      background: #dc2626; color: #fff;
      padding: .35rem 1rem; font-size: .8rem; font-weight: 700;
      display: flex; align-items: center; gap: .4rem;
    }

    /* ---- Notes modal ---- */
    .notes-modal { max-width: 540px; }
    .notes-list { display: flex; flex-direction: column; gap: .75rem; max-height: 340px; overflow-y: auto; padding-right: .25rem; }
    .note-item { background: #f8f9fb; border-radius: 8px; padding: .75rem 1rem; border-left: 3px solid #1d3557; }
    .note-meta { font-size: .75rem; color: #888; margin-bottom: .3rem; display: flex; gap: .5rem; flex-wrap: wrap; }
    .note-meta strong { color: #555; }
    .note-content { font-size: .9rem; color: #1a1a1a; white-space: pre-wrap; line-height: 1.5; }
    .notes-empty { color: #aaa; font-size: .9rem; text-align: center; padding: 1rem 0; }
    .note-add { display: flex; flex-direction: column; gap: .6rem; margin-top: .5rem; padding-top: .75rem; border-top: 1px solid #eee; }
    .note-add textarea { padding: .65rem .9rem; border: 1px solid #ddd; border-radius: 6px; font-size: .9rem; resize: vertical; min-height: 80px; font-family: inherit; }
    .note-add textarea:focus { outline: none; border-color: #1d3557; box-shadow: 0 0 0 3px rgba(29,53,87,.1); }
    .btn-note { background: #1d3557; color: #fff; border: none; border-radius: 6px; padding: .55rem 1.25rem; font-size: .85rem; font-weight: 700; cursor: pointer; align-self: flex-end; }
    .btn-note:disabled { opacity: .5; cursor: not-allowed; }
    .mention-wrap { position: relative; }
    .mention-dropdown {
      position: absolute; bottom: calc(100% + 4px); left: 0; right: 0;
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,.12); z-index: 500; overflow: hidden;
      max-height: 220px; overflow-y: auto;
    }
    .mention-item {
      display: flex; align-items: center; gap: .65rem;
      padding: .55rem .85rem; cursor: pointer; transition: background .1s;
    }
    .mention-item:hover, .mention-item.active { background: #eff6ff; }
    .mention-av {
      width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
      background: #1d3557; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: .7rem; font-weight: 800;
    }
    .mention-name { font-size: .85rem; font-weight: 700; color: #1a1a1a; }
    .mention-email { font-size: .75rem; color: #888; }
    .pagination { display: flex; align-items: center; gap: .35rem; margin-top: .75rem; justify-content: flex-end; }
    .page-info  { font-size: .8rem; color: #888; margin-right: .4rem; }
    .btn-sm.current { background: #1d3557; color: #fff; border-color: #1d3557; }
  `],
  template: `
    <div class="admin-section">
      <h1>Orders</h1>

      <div class="filters">
        <select [(ngModel)]="statusFilter" (change)="onFilterChange()" name="filter">
          <option value="">All Active</option>
          <option>New</option><option>Assigned</option>
          <option>InTransit</option><option>Delivered</option>
          <option>Completed</option><option>Rejected</option>
          <option>DeliverLater</option>
          <option>DispatchToday</option>
          <option>InInventory</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Token</th><th>Customer</th><th>Product</th><th>Variation</th><th>County</th>
            <th>Amount</th>
            <th>Status</th><th>Rider</th><th>Courier</th><th>Date</th><th></th>
          </tr>
        </thead>
        <tbody>
          <ng-container *ngFor="let o of paged">
          <tr [class.delivery-due-row]="isDeliveryDueTomorrow(o)">
            <td>{{ o.trackingToken }}</td>
            <td class="customer-cell" (click)="selected = o" title="View customer details">
              <strong>{{ o.customerName }}</strong><br>
              <small>{{ o.phone }}</small>
            </td>
            <td>{{ o.productTitle }}</td>
            <td>{{ o.variation || '—' }}</td>
            <td>{{ o.county }}</td>
            <td>{{ o.priceAtOrder | number:'1.0-0' }}</td>
            <td>
              <select [(ngModel)]="o.status" (change)="updateStatus(o)">
                <option>New</option><option>Assigned</option>
                <option>InTransit</option>
                <option>Completed</option><option>Rejected</option>
                <option>DeliverLater</option><option>DispatchToday</option>
                <option>InInventory</option>
              </select>
              <input *ngIf="o.status === 'DeliverLater'"
                type="date"
                [(ngModel)]="o.deliveryDate"
                (change)="updateStatus(o)"
                style="margin-top:.35rem;display:block;width:100%;font-size:.8rem;padding:.2rem .4rem;border:1px solid #ddd;border-radius:4px" />
            </td>
            <td>
              <select [(ngModel)]="o.riderId" (change)="assignRider(o)">
                <option [ngValue]="null">— Unassigned —</option>
                <option *ngFor="let r of riders" [ngValue]="r.id">{{ r.name }}</option>
              </select>
            </td>
            <td>
              <select [(ngModel)]="o.courierId" (change)="assignCourier(o)">
                <option [ngValue]="null">— None —</option>
                <option *ngFor="let c of couriers" [ngValue]="c.id">{{ c.name }}</option>
              </select>
            </td>
            <td><small>{{ o.createdAt | date:'dd/MM/yy' }}</small></td>
            <td>
              <div style="display:flex;gap:.35rem;flex-direction:column">
                <button class="btn-sm" (click)="openNotes(o)">Notes</button>
                <button class="btn-sm" [class.danger]="!o.isArchived" (click)="toggleArchive(o)"
                  [title]="o.isArchived ? 'Unarchive' : 'Archive'">
                  {{ o.isArchived ? 'Unarchive' : 'Archive' }}
                </button>
              </div>
            </td>
          </tr>
          <tr *ngIf="isDeliveryDueTomorrow(o)" class="delivery-banner-row">
            <td colspan="15">
              <div class="delivery-due-banner">&#9888; Delivery due tomorrow &mdash; {{ o.deliveryDate | date:'dd MMM yyyy' }}</div>
            </td>
          </tr>
          </ng-container>
          <tr *ngIf="!filtered.length">
            <td colspan="15" style="text-align:center;color:#999;padding:2rem">No orders found.</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination" *ngIf="totalPages > 1">
        <span class="page-info">{{ pageStart }}–{{ pageEnd }} of {{ filtered.length }}</span>
        <button class="btn-sm" [disabled]="page === 1" (click)="goTo(page - 1)">&#8249;</button>
        <button class="btn-sm" *ngFor="let p of pageNumbers" [class.current]="p === page" (click)="goTo(p)">{{ p }}</button>
        <button class="btn-sm" [disabled]="page === totalPages" (click)="goTo(page + 1)">&#8250;</button>
      </div>
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
          <div class="detail-row">
            <span class="detail-label">Email</span>
            <span class="detail-value">
              <a *ngIf="selected.email" href="mailto:{{ selected.email }}">{{ selected.email }}</a>
              <span *ngIf="!selected.email" style="color:#bbb">—</span>
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
          <div class="detail-row" *ngIf="selected.variation">
            <span class="detail-label">Variation</span>
            <span class="detail-value">{{ selected.variation }}</span>
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
          <div class="detail-row" *ngIf="selected.status === 'DeliverLater' && selected.deliveryDate">
            <span class="detail-label">Deliver By</span>
            <span class="detail-value" style="color:#dc2626;font-weight:700">
              {{ selected.deliveryDate | date:'dd MMM yyyy' }}
              <span *ngIf="isDeliveryDueTomorrow(selected)" style="margin-left:.5rem;background:#dc2626;color:#fff;padding:.1rem .5rem;border-radius:4px;font-size:.75rem">Due Tomorrow</span>
            </span>
          </div>
          <div class="detail-row" *ngIf="selected.riderName">
            <span class="detail-label">Rider</span>
            <span class="detail-value">{{ selected.riderName }}</span>
          </div>
          <div class="detail-row" *ngIf="selected.courierName">
            <span class="detail-label">Courier</span>
            <span class="detail-value">{{ selected.courierName }}</span>
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

    <!-- ── Notes Modal ── -->
    <div class="modal-overlay" *ngIf="notesOrder" (click)="onNotesOverlayClick($event)">
      <div class="modal notes-modal" (click)="$event.stopPropagation()">

        <div class="modal-header">
          <h3>Notes — {{ notesOrder.trackingToken }}</h3>
          <button class="modal-close" (click)="notesOrder = null">×</button>
        </div>

        <div class="modal-body">
          <div class="notes-list" *ngIf="notes.length">
            <div class="note-item" *ngFor="let n of notes">
              <div class="note-meta">
                <span>{{ n.createdAt | date:'dd MMM yyyy, HH:mm' }}</span>
                <strong *ngIf="n.createdBy">{{ n.createdBy }}</strong>
              </div>
              <div class="note-content">{{ n.content }}</div>
            </div>
          </div>
          <div class="notes-empty" *ngIf="!notes.length && !notesLoading">No notes yet.</div>
          <div class="notes-empty" *ngIf="notesLoading">Loading…</div>

          <div class="note-add">
            <div class="mention-wrap">
              <div class="mention-dropdown" *ngIf="showMentions && filteredMentions.length">
                <div class="mention-item"
                  *ngFor="let u of filteredMentions; let i = index"
                  [class.active]="i === mentionIndex"
                  (mousedown)="insertMention(u)">
                  <div class="mention-av">{{ initials(u.fullName || u.email) }}</div>
                  <div>
                    <div class="mention-name">{{ u.fullName || u.email }}</div>
                    <div class="mention-email">{{ u.email }}</div>
                  </div>
                </div>
              </div>
              <textarea
                placeholder="Add a note… type @ to mention someone"
                [(ngModel)]="newNote"
                name="newNote"
                (input)="onNoteInput($event)"
                (keydown)="onNoteKeydown($event)">
              </textarea>
            </div>
            <button class="btn-note" [disabled]="!newNote.trim() || savingNote" (click)="saveNote()">
              {{ savingNote ? 'Saving…' : 'Add Note' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  riders: Rider[] = [];
  couriers: Courier[] = [];
  statusFilter = '';
  selected: Order | null = null;
  page = 1;
  readonly PAGE_SIZE = 10;

  // Notes
  notesOrder: Order | null = null;
  notes: OrderNote[] = [];
  newNote = '';
  notesLoading = false;
  savingNote = false;

  // @mention
  allUsers: AdminUser[] = [];
  showMentions = false;
  mentionQuery = '';
  mentionStart = 0;
  mentionIndex = 0;

  get filteredMentions() {
    const q = this.mentionQuery.toLowerCase();
    return this.allUsers
      .filter(u => !q || (u.fullName || '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .slice(0, 6);
  }

  initials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.selected = null;
  }

  onNotesOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.notesOrder = null;
  }

  openNotes(o: Order) {
    this.notesOrder = o;
    this.notes = [];
    this.newNote = '';
    this.showMentions = false;
    this.notesLoading = true;
    this.cdr.markForCheck();
    this.orderService.getNotes(o.id).subscribe({
      next: n => { this.notes = n; this.notesLoading = false; this.cdr.markForCheck(); },
      error: () => { this.notesLoading = false; this.cdr.markForCheck(); }
    });
    if (!this.allUsers.length) {
      this.userService.getAll().subscribe(u => { this.allUsers = u; this.cdr.markForCheck(); });
    }
  }

  onNoteInput(e: Event) {
    const ta = e.target as HTMLTextAreaElement;
    const pos = ta.selectionStart ?? ta.value.length;
    const before = ta.value.slice(0, pos);
    const match = before.match(/@([^\s@]*)$/);
    if (match) {
      this.mentionQuery = match[1].toLowerCase();
      this.mentionStart = pos - match[0].length;
      this.mentionIndex = 0;
      this.showMentions = true;
    } else {
      this.showMentions = false;
    }
    this.cdr.markForCheck();
  }

  onNoteKeydown(e: KeyboardEvent) {
    if (!this.showMentions) return;
    const len = this.filteredMentions.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); this.mentionIndex = (this.mentionIndex + 1) % len; this.cdr.markForCheck(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.mentionIndex = (this.mentionIndex - 1 + len) % len; this.cdr.markForCheck(); }
    else if (e.key === 'Enter' && this.filteredMentions[this.mentionIndex]) { e.preventDefault(); this.insertMention(this.filteredMentions[this.mentionIndex]); }
    else if (e.key === 'Escape') { this.showMentions = false; this.cdr.markForCheck(); }
  }

  insertMention(u: AdminUser) {
    const ta = document.querySelector('textarea[name="newNote"]') as HTMLTextAreaElement;
    const pos = ta?.selectionStart ?? this.newNote.length;
    const before = this.newNote.slice(0, this.mentionStart);
    const after = this.newNote.slice(pos);
    this.newNote = `${before}@${u.fullName || u.email} ${after}`;
    this.showMentions = false;
    this.cdr.markForCheck();
    setTimeout(() => { ta?.focus(); const end = this.mentionStart + (u.fullName || u.email).length + 2; ta?.setSelectionRange(end, end); });
  }

  saveNote() {
    if (!this.notesOrder || !this.newNote.trim()) return;
    this.savingNote = true;
    this.cdr.markForCheck();
    this.orderService.addNote(this.notesOrder.id, this.newNote.trim()).subscribe({
      next: note => {
        this.notes = [...this.notes, note];
        this.newNote = '';
        this.savingNote = false;
        this.cdr.markForCheck();
      },
      error: () => { this.savingNote = false; this.cdr.markForCheck(); }
    });
  }

  get filtered() {
    if (this.statusFilter && this.statusFilter !== 'Archived')
      return this.orders.filter(o => o.status === this.statusFilter);
    return this.orders;
  }

  get totalPages()  { return Math.max(1, Math.ceil(this.filtered.length / this.PAGE_SIZE)); }
  get paged()       { const s = (this.page - 1) * this.PAGE_SIZE; return this.filtered.slice(s, s + this.PAGE_SIZE); }
  get pageStart()   { return (this.page - 1) * this.PAGE_SIZE + 1; }
  get pageEnd()     { return Math.min(this.page * this.PAGE_SIZE, this.filtered.length); }
  get pageNumbers(): number[] {
    const s = Math.max(1, this.page - 2), e = Math.min(this.totalPages, this.page + 2);
    return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  }
  goTo(p: number) { this.page = Math.max(1, Math.min(p, this.totalPages)); this.cdr.markForCheck(); }

  constructor(
    private orderService: OrderService,
    private riderService: RiderService,
    private courierService: CourierService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
    this.riderService.getAll().subscribe(r => { this.riders = r; this.cdr.markForCheck(); });
    this.courierService.getAll().subscribe(c => { this.couriers = c; this.cdr.markForCheck(); });
  }

  load() {
    const call = this.statusFilter === 'Archived'
      ? this.orderService.getArchived()
      : this.orderService.getAll();
    call.subscribe(o => { this.orders = o; this.page = 1; this.cdr.markForCheck(); });
  }

  onFilterChange() {
    this.page = 1;
    this.load();
  }

  updateStatus(o: Order) {
    this.orderService.updateStatus(o.id, o.status, o.deliveryDate).subscribe();
  }

  isDeliveryDueTomorrow(o: Order): boolean {
    if (o.status !== 'DeliverLater' || !o.deliveryDate) return false;
    const t = new Date();
    const tomorrow = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
    return o.deliveryDate.startsWith(tomorrowStr);
  }

  assignRider(o: Order) {
    if (o.riderId) this.orderService.assignRider(o.id, o.riderId).subscribe();
  }

  assignCourier(o: Order) {
    if (o.courierId) this.orderService.assignCourier(o.id, o.courierId).subscribe();
  }

  saveExpenses(o: Order) {
    this.orderService.updateExpenses(o.id, o.buyingPrice, o.advertisingCost, o.deliveryFee).subscribe();
  }

  toggleArchive(o: Order) {
    this.orderService.archive(o.id).subscribe(() => this.load());
  }
}
