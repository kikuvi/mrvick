import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourierService, Courier } from '../../../services/courier.service';

@Component({
  selector: 'app-admin-couriers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h1>Couriers</h1>
        <button class="btn btn-primary" (click)="showForm = !showForm">
          {{ showForm ? 'Cancel' : '+ Add Courier' }}
        </button>
      </div>

      <div class="form-card" *ngIf="showForm">
        <form (ngSubmit)="save()">
          <input type="text" placeholder="Courier Name (e.g. Standard, Nation, Ena Coach)"
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
            <td><button class="btn-sm danger" (click)="delete(c.id)">Remove</button></td>
          </tr>
          <tr *ngIf="!couriers.length">
            <td colspan="3" style="text-align:center;color:#999;padding:2rem">No couriers yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AdminCouriersComponent implements OnInit {
  couriers: Courier[] = [];
  showForm = false;
  newName = '';

  constructor(private courierService: CourierService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.courierService.getAll().subscribe(c => { this.couriers = c; this.cdr.markForCheck(); });
  }

  save() {
    if (!this.newName.trim()) return;
    this.courierService.create(this.newName.trim()).subscribe(() => {
      this.showForm = false;
      this.newName = '';
      this.load();
    });
  }

  delete(id: string) {
    if (confirm('Remove this courier?')) this.courierService.delete(id).subscribe(() => this.load());
  }
}
