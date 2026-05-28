import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, InventoryItem, MoveFromInventoryPayload } from '../../../services/inventory.service';

const emptyMove = (): MoveFromInventoryPayload => ({
  reason: '',
  fulfillmentNote: null,
  approverEmail: '',
  approverPassword: ''
});

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-section">

      <div class="section-header">
        <h1>Inventory
          <span class="count-badge" *ngIf="available.length">{{ available.length }}</span>
        </h1>
        <div class="view-toggle">
          <button class="vt-btn" [class.active]="view === 'available'" (click)="view = 'available'">
            Available <span class="vt-count">{{ available.length }}</span>
          </button>
          <button class="vt-btn" [class.active]="view === 'moved'" (click)="view = 'moved'">
            Moved <span class="vt-count moved-count">{{ moved.length }}</span>
          </button>
        </div>
      </div>

      <ng-container *ngIf="loading">
        <p class="loading-text">Loading…</p>
      </ng-container>

      <ng-container *ngIf="!loading">
        <div *ngIf="displayed.length === 0" class="empty-state">
          {{ view === 'available' ? 'No items in inventory.' : 'No items have been moved yet.' }}
        </div>

        <table *ngIf="displayed.length > 0" class="table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Product</th>
              <th>Variation</th>
              <th>Buying Price</th>
              <th>Added</th>
              <th *ngIf="view === 'available'">Notes</th>
              <th *ngIf="view === 'moved'">Reason</th>
              <th *ngIf="view === 'moved'">Fulfils Order</th>
              <th *ngIf="view === 'moved'">Moved By</th>
              <th *ngIf="view === 'moved'">Approved By</th>
              <th *ngIf="view === 'moved'">Moved At</th>
              <th *ngIf="view === 'available'"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of displayed">
              <td><code>{{ item.trackingToken }}</code></td>
              <td>{{ item.productTitle }}</td>
              <td>{{ item.variation || '—' }}</td>
              <td>KES {{ item.buyingPrice | number:'1.0-0' }}</td>
              <td><small>{{ item.createdAt | date:'dd/MM/yy' }}</small></td>
              <td *ngIf="view === 'available'">{{ item.notes || '—' }}</td>
              <td *ngIf="view === 'moved'">{{ item.movement?.reason }}</td>
              <td *ngIf="view === 'moved'">{{ item.movement?.fulfillmentNote || '—' }}</td>
              <td *ngIf="view === 'moved'">{{ item.movement?.movedBy }}</td>
              <td *ngIf="view === 'moved'">{{ item.movement?.approvedBy }}</td>
              <td *ngIf="view === 'moved'"><small>{{ item.movement?.movedAt | date:'dd/MM/yy HH:mm' }}</small></td>
              <td *ngIf="view === 'available'">
                <button class="btn-move" (click)="openMove(item)">Move Out</button>
              </td>
            </tr>
          </tbody>
        </table>
      </ng-container>

      <!-- Move modal -->
      <div class="modal-backdrop" *ngIf="moveTarget" (click)="closeMove()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Move Item from Inventory</h2>
            <button class="close-btn" (click)="closeMove()">✕</button>
          </div>

          <div class="item-summary">
            <strong>{{ moveTarget.productTitle }}</strong>
            <span *ngIf="moveTarget.variation"> — {{ moveTarget.variation }}</span>
            <span class="token-badge">{{ moveTarget.trackingToken }}</span>
          </div>

          <form class="modal-form" #moveForm="ngForm" (ngSubmit)="submitMove(moveForm)">
            <div class="form-group">
              <label>Reason <span class="req">*</span></label>
              <input type="text" [(ngModel)]="movePayload.reason" name="reason" required
                placeholder="e.g. Used to fulfil order, Damaged, Returned to supplier…" />
            </div>
            <div class="form-group">
              <label>Fulfils Order (optional)</label>
              <input type="text" [(ngModel)]="movePayload.fulfillmentNote" name="fulfillmentNote"
                placeholder="e.g. Order #ABC123 — John Doe, Nairobi" />
            </div>

            <div class="approver-section">
              <div class="approver-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Second Approver Required
              </div>
              <p class="approver-hint">A second authorised user must verify this movement.</p>
              <div class="form-group">
                <label>Approver Email <span class="req">*</span></label>
                <input type="email" [(ngModel)]="movePayload.approverEmail" name="approverEmail" required
                  placeholder="approver@example.com" autocomplete="off" />
              </div>
              <div class="form-group">
                <label>Approver Password <span class="req">*</span></label>
                <input type="password" [(ngModel)]="movePayload.approverPassword" name="approverPassword" required
                  placeholder="••••••••" autocomplete="new-password" />
              </div>
            </div>

            <p class="form-error" *ngIf="moveError">{{ moveError }}</p>

            <div class="modal-footer">
              <button type="button" class="cancel-btn" (click)="closeMove()">Cancel</button>
              <button type="submit" class="submit-btn submit-btn--danger"
                [disabled]="moving || moveForm.invalid">
                {{ moving ? 'Processing…' : 'Confirm Move' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .section-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .section-header h1 { margin: 0; }
    .count-badge { background: #e5e7eb; color: #374151; font-size: .75rem; font-weight: 700; border-radius: 12px; padding: .1rem .55rem; margin-left: .4rem; }
    .view-toggle { display: flex; gap: .35rem; margin-left: auto; }
    .vt-btn { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: .35rem .85rem; font-size: .82rem; font-weight: 600; color: #555; cursor: pointer; transition: all .15s; }
    .vt-btn.active { background: #1d3557; color: #fff; border-color: #1d3557; }
    .vt-count { display: inline-block; background: rgba(255,255,255,.25); border-radius: 10px; padding: 0 .4rem; margin-left: .3rem; font-size: .75rem; }
    .moved-count { background: #fef3c7; color: #92400e; }
    .loading-text, .empty-state { color: #aaa; padding: 1.5rem 0; font-size: .95rem; }
    code { font-family: monospace; font-size: .85rem; background: #f3f4f6; padding: .1rem .35rem; border-radius: 4px; }
    .btn-move { background: #1d3557; color: #fff; border: none; border-radius: 6px; padding: .35rem .85rem; font-size: .8rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
    .btn-move:hover { background: #16304d; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 300; padding: 1rem; }
    .modal { background: #fff; border-radius: 12px; width: 100%; max-width: 500px; box-shadow: 0 12px 48px rgba(0,0,0,.22); overflow: hidden; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.1rem 1.4rem; background: #1d3557; color: #fff; }
    .modal-header h2 { margin: 0; font-size: 1rem; font-weight: 700; }
    .close-btn { background: rgba(255,255,255,.15); border: none; color: #fff; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; }
    .close-btn:hover { background: rgba(255,255,255,.3); }
    .item-summary { padding: .75rem 1.4rem; background: #f8f9fb; border-bottom: 1px solid #eee; font-size: .9rem; display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
    .token-badge { font-family: monospace; font-size: .8rem; background: #e5e7eb; color: #374151; padding: .1rem .45rem; border-radius: 4px; margin-left: auto; }
    .modal-form { padding: 1.25rem 1.4rem; display: flex; flex-direction: column; gap: .85rem; }
    .form-group { display: flex; flex-direction: column; gap: .35rem; }
    .form-group label { font-size: .82rem; font-weight: 700; color: #374151; }
    .form-group input { padding: .6rem .85rem; border: 1px solid #ddd; border-radius: 6px; font-size: .9rem; }
    .form-group input:focus { outline: none; border-color: #1d3557; box-shadow: 0 0 0 3px rgba(29,53,87,.1); }
    .req { color: #e63946; }
    .approver-section { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: .75rem; }
    .approver-label { display: flex; align-items: center; gap: .45rem; font-size: .85rem; font-weight: 700; color: #92400e; }
    .approver-hint { margin: 0; font-size: .8rem; color: #a16207; }
    .form-error { color: #e63946; font-size: .85rem; margin: 0; }
    .modal-footer { padding: .9rem 1.4rem; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: .75rem; }
    .cancel-btn { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: .55rem 1.25rem; font-size: .85rem; font-weight: 600; cursor: pointer; color: #374151; }
    .submit-btn { background: #1d3557; color: #fff; border: none; border-radius: 6px; padding: .55rem 1.25rem; font-size: .85rem; font-weight: 700; cursor: pointer; }
    .submit-btn--danger { background: #dc2626; }
    .submit-btn:disabled { opacity: .5; cursor: not-allowed; }
  `]
})
export class AdminInventoryComponent implements OnInit {
  items: InventoryItem[] = [];
  loading = true;
  view: 'available' | 'moved' = 'available';

  moveTarget: InventoryItem | null = null;
  movePayload: MoveFromInventoryPayload = emptyMove();
  moving = false;
  moveError = '';

  constructor(
    private inventoryService: InventoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading = true;
    this.inventoryService.getAll().subscribe({
      next: items => {
        this.items = items;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get available() { return this.items.filter(i => !i.isMoved); }
  get moved()     { return this.items.filter(i => i.isMoved); }
  get displayed() { return this.view === 'available' ? this.available : this.moved; }

  openMove(item: InventoryItem) {
    this.moveTarget = item;
    this.movePayload = emptyMove();
    this.moveError = '';
    this.cdr.markForCheck();
  }

  closeMove() {
    this.moveTarget = null;
    this.cdr.markForCheck();
  }

  submitMove(form: any) {
    if (form.invalid || !this.moveTarget) return;
    this.moving = true;
    this.moveError = '';

    this.inventoryService.move(this.moveTarget.id, this.movePayload).subscribe({
      next: movement => {
        const item = this.items.find(i => i.id === this.moveTarget!.id);
        if (item) {
          item.isMoved = true;
          item.movedAt = movement.movedAt;
          item.movement = movement;
        }
        this.moving = false;
        this.moveTarget = null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.moveError = err?.error?.error ?? 'Failed to move item. Please try again.';
        this.moving = false;
        this.cdr.markForCheck();
      }
    });
  }
}
