import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourierService, Courier, CourierOffice } from '../../../services/courier.service';

@Component({
  selector: 'app-admin-couriers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .tabs { display: flex; gap: 0; border-bottom: 2px solid #e5e7eb; margin-bottom: 1.5rem; }
    .tab-btn {
      padding: .6rem 1.4rem; font-size: .9rem; font-weight: 700; border: none;
      background: none; cursor: pointer; color: #888; border-bottom: 3px solid transparent;
      margin-bottom: -2px; transition: color .15s;
    }
    .tab-btn.active { color: #1d3557; border-bottom-color: #1d3557; }
    .tab-btn:hover:not(.active) { color: #374151; }
  `],
  template: `
    <div class="admin-section">
      <h1>Couriers</h1>

      <div class="tabs">
        <button class="tab-btn" [class.active]="tab === 'couriers'" (click)="tab = 'couriers'">Couriers</button>
        <button class="tab-btn" [class.active]="tab === 'offices'" (click)="tab = 'offices'">Courier Offices</button>
      </div>

      <!-- ── Tab: Couriers ── -->
      <ng-container *ngIf="tab === 'couriers'">
        <div class="section-header">
          <span></span>
          <button class="btn btn-primary" (click)="showCourierForm = !showCourierForm">
            {{ showCourierForm ? 'Cancel' : '+ Add Courier' }}
          </button>
        </div>

        <div class="form-card" *ngIf="showCourierForm">
          <form (ngSubmit)="saveCourier()">
            <input type="text" placeholder="Courier name (e.g. Standard, Nation, Ena Coach)"
              [(ngModel)]="newName" name="name" required />
            <button type="submit" class="btn btn-primary" [disabled]="!newName.trim()">Add Courier</button>
          </form>
        </div>

        <table class="table">
          <thead>
            <tr><th>Name</th><th>Added</th><th></th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of couriers">
              <td>{{ c.name }}</td>
              <td>{{ c.createdAt | date:'dd/MM/yyyy' }}</td>
              <td><button class="btn-sm danger" (click)="deleteCourier(c.id)">Remove</button></td>
            </tr>
            <tr *ngIf="!couriers.length">
              <td colspan="3" style="text-align:center;color:#999;padding:2rem">No couriers yet.</td>
            </tr>
          </tbody>
        </table>
      </ng-container>

      <!-- ── Tab: Courier Offices ── -->
      <ng-container *ngIf="tab === 'offices'">
        <div class="section-header">
          <span></span>
          <button class="btn btn-primary" (click)="showOfficeForm = !showOfficeForm">
            {{ showOfficeForm ? 'Cancel' : '+ Add Office' }}
          </button>
        </div>

        <div class="form-card" *ngIf="showOfficeForm">
          <form (ngSubmit)="saveOffice()">
            <select [(ngModel)]="officeForm.courierId" name="courierId" required>
              <option value="">Select Courier</option>
              <option *ngFor="let c of couriers" [value]="c.id">{{ c.name }}</option>
            </select>
            <input type="text" placeholder="Office name / location (e.g. Nairobi CBD)"
              [(ngModel)]="officeForm.office" name="office" required />
            <input type="tel" placeholder="Phone number"
              [(ngModel)]="officeForm.phone" name="phone" required />
            <button type="submit" class="btn btn-primary"
              [disabled]="!officeForm.courierId || !officeForm.office.trim() || !officeForm.phone.trim()">
              Add Office
            </button>
          </form>
        </div>

        <table class="table">
          <thead>
            <tr><th>Courier</th><th>Office</th><th>Phone</th><th>Added</th><th></th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of offices">
              <td><strong>{{ o.courierName }}</strong></td>
              <td>{{ o.office }}</td>
              <td>{{ o.phone }}</td>
              <td>{{ o.createdAt | date:'dd/MM/yyyy' }}</td>
              <td><button class="btn-sm danger" (click)="deleteOffice(o.id)">Remove</button></td>
            </tr>
            <tr *ngIf="!offices.length">
              <td colspan="5" style="text-align:center;color:#999;padding:2rem">No offices yet.</td>
            </tr>
          </tbody>
        </table>
      </ng-container>
    </div>
  `
})
export class AdminCouriersComponent implements OnInit {
  tab: 'couriers' | 'offices' = 'couriers';

  couriers: Courier[] = [];
  showCourierForm = false;
  newName = '';

  offices: CourierOffice[] = [];
  showOfficeForm = false;
  officeForm = { courierId: '', office: '', phone: '' };

  constructor(private courierService: CourierService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadCouriers();
    this.loadOffices();
  }

  loadCouriers() {
    this.courierService.getAll().subscribe(c => { this.couriers = c; this.cdr.markForCheck(); });
  }

  loadOffices() {
    this.courierService.getOffices().subscribe(o => { this.offices = o; this.cdr.markForCheck(); });
  }

  saveCourier() {
    if (!this.newName.trim()) return;
    this.courierService.create(this.newName.trim()).subscribe(() => {
      this.showCourierForm = false;
      this.newName = '';
      this.loadCouriers();
    });
  }

  deleteCourier(id: string) {
    if (confirm('Remove this courier?')) this.courierService.delete(id).subscribe(() => this.loadCouriers());
  }

  saveOffice() {
    const { courierId, office, phone } = this.officeForm;
    if (!courierId || !office.trim() || !phone.trim()) return;
    this.courierService.createOffice(courierId, office.trim(), phone.trim()).subscribe(() => {
      this.showOfficeForm = false;
      this.officeForm = { courierId: '', office: '', phone: '' };
      this.loadOffices();
    });
  }

  deleteOffice(id: string) {
    if (confirm('Remove this office?')) this.courierService.deleteOffice(id).subscribe(() => this.loadOffices());
  }
}
