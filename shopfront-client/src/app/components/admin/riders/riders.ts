import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiderService, Rider } from '../../../services/rider.service';

@Component({
  selector: 'app-admin-riders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h1>Riders</h1>
        <button class="btn btn-primary" (click)="showForm = !showForm">
          {{ showForm ? 'Cancel' : '+ Add Rider' }}
        </button>
      </div>

      <div class="form-card" *ngIf="showForm">
        <form (ngSubmit)="save()">
          <input type="text" placeholder="Full Name" [(ngModel)]="form.name" name="name" required />
          <input type="tel" placeholder="Phone" [(ngModel)]="form.phone" name="phone" required />
          <input type="text" placeholder="County" [(ngModel)]="form.county" name="county" required />
          <input type="text" placeholder="Local Town" [(ngModel)]="form.localTown" name="localTown" required />
          <button type="submit" class="btn btn-primary">Add Rider</button>
        </form>
      </div>

      <table class="table">
        <thead>
          <tr><th>Name</th><th>Phone</th><th>County</th><th>Town</th><th>Joined</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of riders">
            <td>{{ r.name }}</td>
            <td>{{ r.phone }}</td>
            <td>{{ r.county }}</td>
            <td>{{ r.localTown }}</td>
            <td>{{ r.createdAt | date:'dd/MM/yyyy' }}</td>
            <td><button class="btn-sm danger" (click)="delete(r.id)">Remove</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AdminRidersComponent implements OnInit {
  riders: Rider[] = [];
  showForm = false;
  form = { name: '', phone: '', county: '', localTown: '' };

  constructor(private riderService: RiderService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() { this.riderService.getAll().subscribe(r => { this.riders = r; this.cdr.markForCheck(); }); }

  save() {
    this.riderService.create(this.form).subscribe(() => {
      this.showForm = false;
      this.form = { name: '', phone: '', county: '', localTown: '' };
      this.cdr.markForCheck();
      this.load();
    });
  }

  delete(id: number) {
    if (confirm('Remove this rider?')) this.riderService.delete(id).subscribe(() => this.load());
  }
}
