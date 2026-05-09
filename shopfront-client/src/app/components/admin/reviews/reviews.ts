import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingService, Rating } from '../../../services/rating.service';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h1>Reviews</h1>
        <div style="display:flex;gap:.5rem">
          <button class="btn" [class.btn-primary]="filter === 'pending'" (click)="setFilter('pending')">Pending ({{ pending.length }})</button>
          <button class="btn" [class.btn-primary]="filter === 'approved'" (click)="setFilter('approved')">Approved ({{ approved.length }})</button>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Customer</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of visibleRatings">
            <td>{{ r.productTitle }}</td>
            <td>{{ r.customerName }}</td>
            <td>{{ starsFor(r.rating) }}</td>
            <td style="max-width:260px">{{ r.comment }}</td>
            <td>{{ r.createdAt | date:'mediumDate' }}</td>
            <td>
              <div style="display:flex;gap:.4rem;flex-wrap:wrap">
                <button *ngIf="!r.isApproved" class="btn-sm" (click)="approve(r)">Approve</button>
                <button class="btn-sm danger" (click)="delete(r)">Delete</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="!visibleRatings.length">
            <td colspan="6" class="empty">No {{ filter }} reviews.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AdminReviewsComponent implements OnInit {
  all: Rating[] = [];
  filter: 'pending' | 'approved' = 'pending';

  get pending() { return this.all.filter(r => !r.isApproved); }
  get approved() { return this.all.filter(r => r.isApproved); }
  get visibleRatings() { return this.filter === 'pending' ? this.pending : this.approved; }

  constructor(private ratingService: RatingService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.ratingService.getAll().subscribe(r => { this.all = r; this.cdr.markForCheck(); });
  }

  setFilter(f: 'pending' | 'approved') { this.filter = f; }

  starsFor(n: number): string { return '★'.repeat(n) + '☆'.repeat(5 - n); }

  approve(r: Rating) {
    this.ratingService.approve(r.id).subscribe(() => { r.isApproved = true; this.cdr.markForCheck(); });
  }

  delete(r: Rating) {
    if (!confirm('Delete this review?')) return;
    this.ratingService.delete(r.id).subscribe(() => { this.all = this.all.filter(x => x.id !== r.id); this.cdr.markForCheck(); });
  }
}
