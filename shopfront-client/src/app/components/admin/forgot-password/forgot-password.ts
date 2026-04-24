import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h1>Forgot Password</h1>

        <ng-container *ngIf="!sent">
          <p style="color:#555;margin-bottom:1rem;font-size:.95rem">
            Enter your admin email and we'll send you a reset link.
          </p>
          <form (ngSubmit)="submit()">
            <input type="email" placeholder="Email" [(ngModel)]="email" name="email" required />
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              {{ loading ? 'Sending…' : 'Send Reset Link' }}
            </button>
            <p class="error" *ngIf="error">{{ error }}</p>
          </form>
        </ng-container>

        <ng-container *ngIf="sent">
          <div style="text-align:center;padding:1rem 0">
            <div style="font-size:2.5rem;margin-bottom:.75rem">&#9993;</div>
            <p style="color:#155724;font-weight:600;margin-bottom:.5rem">Reset link sent!</p>
            <p style="color:#555;font-size:.9rem">Check your inbox and follow the link to reset your password.</p>
          </div>
        </ng-container>

        <p style="text-align:center;margin-top:1.25rem;font-size:.9rem">
          <a routerLink="/admin/login" style="color:#1d3557">Back to login</a>
        </p>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  error = '';
  sent = false;

  constructor(private auth: AuthService, private cdr: ChangeDetectorRef) {}

  submit() {
    this.error = '';
    this.loading = true;
    this.cdr.markForCheck();
    this.auth.forgotPassword(this.email).subscribe({
      next: () => { this.sent = true; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.error = 'Something went wrong. Please try again.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }
}
