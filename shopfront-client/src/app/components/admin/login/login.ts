import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h1>Shopfront Admin</h1>
        <form (ngSubmit)="login()" #f="ngForm">
          <input type="email" placeholder="Email" [(ngModel)]="email" name="email" required />
          <input type="password" placeholder="Password" [(ngModel)]="password" name="password" required />
          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
          <p class="error" *ngIf="error">{{ error }}</p>
        </form>
        <p style="text-align:center;margin-top:1rem;font-size:.9rem">
          <a routerLink="/admin/forgot-password" style="color:#1d3557">Forgot password?</a>
        </p>
      </div>
    </div>
  `
})
export class AdminLoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  login() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: () => { this.error = 'Invalid email or password.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }
}
