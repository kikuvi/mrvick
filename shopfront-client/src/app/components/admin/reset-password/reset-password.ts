import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h1>Reset Password</h1>

        <div *ngIf="!token || !email" style="text-align:center;color:#e63946;padding:1rem 0">
          <p>Invalid or expired reset link.</p>
          <a routerLink="/admin/forgot-password" style="color:#1d3557">Request a new one</a>
        </div>

        <ng-container *ngIf="token && email && !done">
          <form (ngSubmit)="submit()">
            <input type="password" placeholder="New password (min 8 characters)"
              [(ngModel)]="password" name="password" required minlength="8" />
            <input type="password" placeholder="Confirm new password"
              [(ngModel)]="confirm" name="confirm" required />
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              {{ loading ? 'Resetting…' : 'Reset Password' }}
            </button>
            <p class="error" *ngIf="error">{{ error }}</p>
          </form>
        </ng-container>

        <ng-container *ngIf="done">
          <div style="text-align:center;padding:1rem 0">
            <div style="font-size:2.5rem;margin-bottom:.75rem">&#10003;</div>
            <p style="color:#155724;font-weight:600;margin-bottom:.5rem">Password reset!</p>
            <p style="color:#555;font-size:.9rem;margin-bottom:1rem">You can now log in with your new password.</p>
            <a routerLink="/admin/login" class="btn btn-primary" style="display:inline-block">Go to Login</a>
          </div>
        </ng-container>

        <p style="text-align:center;margin-top:1.25rem;font-size:.9rem" *ngIf="!done">
          <a routerLink="/admin/login" style="color:#1d3557">Back to login</a>
        </p>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  email = '';
  token = '';
  password = '';
  confirm = '';
  loading = false;
  error = '';
  done = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.cdr.markForCheck();
  }

  submit() {
    this.error = '';
    if (this.password !== this.confirm) {
      this.error = 'Passwords do not match.';
      return;
    }
    this.loading = true;
    this.cdr.markForCheck();
    this.auth.resetPassword(this.email, this.token, this.password).subscribe({
      next: () => { this.done = true; this.loading = false; this.cdr.markForCheck(); },
      error: err => {
        this.error = err.error?.error ?? 'Reset failed. The link may have expired.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
