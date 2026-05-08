import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorItemService, VendorItem, SaveVendorItem } from '../../../services/vendor-item.service';

@Component({
  selector: 'app-admin-vendor-items',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 200; padding: 1rem;
    }
    .modal {
      background: #fff; border-radius: 12px; width: 100%; max-width: 500px;
      box-shadow: 0 12px 48px rgba(0,0,0,.25); overflow: hidden;
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
    .field { display: flex; flex-direction: column; gap: .3rem; }
    .field label { font-size: .82rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: .4px; }
    .field input {
      padding: .65rem .9rem; border: 1px solid #ddd; border-radius: 6px; font-size: .95rem;
    }
    .field input:focus { outline: none; border-color: #1d3557; box-shadow: 0 0 0 3px rgba(29,53,87,.1); }
    .modal-footer { padding: .9rem 1.4rem; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: .6rem; }
  `],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h1>Vendor Items</h1>
        <button class="btn btn-primary" (click)="openNew()">+ Add Item</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Item Name</th><th>Vendor</th><th>Location</th>
            <th>Price (KES)</th><th>Contacts</th><th>Date</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let v of items">
            <td>{{ v.itemName }}</td>
            <td>{{ v.vendor }}</td>
            <td>{{ v.location }}</td>
            <td>{{ v.price | number:'1.0-0' }}</td>
            <td>{{ v.contacts }}</td>
            <td><small>{{ v.createdAt | date:'dd/MM/yyyy' }}</small></td>
            <td>
              <div style="display:flex;gap:.4rem">
                <button class="btn-sm" (click)="openEdit(v)">Edit</button>
                <button class="btn-sm danger" (click)="delete(v.id)">Delete</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="!items.length">
            <td colspan="7" class="empty">No vendor items yet. Add one above.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add / Edit Modal -->
    <div class="modal-overlay" *ngIf="showForm" (click)="onOverlay($event)">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? 'Edit Item' : 'Add Item' }}</h3>
          <button class="modal-close" (click)="reset()">×</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label>Item Name</label>
            <input type="text" placeholder="e.g. Leather Car Seat Cover" [(ngModel)]="form.itemName" />
          </div>
          <div class="field">
            <label>Vendor</label>
            <input type="text" placeholder="e.g. AutoSupplies Ltd" [(ngModel)]="form.vendor" />
          </div>
          <div class="field">
            <label>Location</label>
            <input type="text" placeholder="e.g. Nairobi, Kirinyaga Road" [(ngModel)]="form.location" />
          </div>
          <div class="field">
            <label>Price (KES)</label>
            <input type="number" placeholder="e.g. 2500" [(ngModel)]="form.price" min="0" />
          </div>
          <div class="field">
            <label>Contacts</label>
            <input type="text" placeholder="e.g. 0712345678" [(ngModel)]="form.contacts" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" style="font-size:.85rem;padding:.5rem 1.25rem" (click)="reset()">Cancel</button>
          <button class="btn btn-primary" style="font-size:.85rem;padding:.5rem 1.25rem" [disabled]="saving" (click)="save()">
            {{ saving ? 'Saving…' : (editing ? 'Update' : 'Add Item') }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminVendorItemsComponent implements OnInit {
  items: VendorItem[] = [];
  showForm = false;
  editing: VendorItem | null = null;
  saving = false;
  form: SaveVendorItem = { itemName: '', vendor: '', location: '', price: 0, contacts: '' };

  constructor(private service: VendorItemService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.service.getAll().subscribe(items => { this.items = items; this.cdr.markForCheck(); });
  }

  openNew() {
    this.editing = null;
    this.form = { itemName: '', vendor: '', location: '', price: 0, contacts: '' };
    this.showForm = true;
    this.cdr.markForCheck();
  }

  openEdit(v: VendorItem) {
    this.editing = v;
    this.form = { itemName: v.itemName, vendor: v.vendor, location: v.location, price: v.price, contacts: v.contacts };
    this.showForm = true;
    this.cdr.markForCheck();
  }

  save() {
    this.saving = true;
    this.cdr.markForCheck();
    const done = () => { this.saving = false; this.reset(); this.load(); };
    const err  = () => { this.saving = false; this.cdr.markForCheck(); };

    if (this.editing) {
      this.service.update(this.editing.id, this.form).subscribe({ next: done, error: err });
    } else {
      this.service.create(this.form).subscribe({ next: done, error: err });
    }
  }

  delete(id: string) {
    if (confirm('Delete this item?')) {
      this.service.delete(id).subscribe(() => this.load());
    }
  }

  reset() {
    this.showForm = false;
    this.editing = null;
    this.saving = false;
    this.form = { itemName: '', vendor: '', location: '', price: 0, contacts: '' };
    this.cdr.markForCheck();
  }

  onOverlay(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.reset();
  }
}
