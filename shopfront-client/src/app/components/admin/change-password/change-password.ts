import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h1>Change Password</h1>
        <p style="text-align:center;color:#555;font-size:.9rem;margin-bottom:1.25rem">
          You must set a new password before continuing.
        </p>
        <form (ngSubmit)="submit()" #f="ngForm">
          <input type="password" placeholder="Current password" [(ngModel)]="currentPassword" name="currentPassword" required />
          <input type="password" placeholder="New password (min 8 chars)" [(ngModel)]="newPassword" name="newPassword" required minlength="8" />
          <input type="password" placeholder="Confirm new password" [(ngModel)]="confirmPassword" name="confirmPassword" required />
          <p class="error" *ngIf="mismatch">Passwords do not match.</p>
          <p class="error" *ngIf="error">{{ error }}</p>
          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Saving...' : 'Set New Password' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  error = '';
  mismatch = false;

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  submit() {
    this.mismatch = false;
    this.error = '';
    if (this.newPassword !== this.confirmPassword) { this.mismatch = true; return; }
    this.loading = true;
    this.auth.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: err => {
        this.error = err.error?.error ?? 'Failed to change password.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
