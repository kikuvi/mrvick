import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService, private router: Router) {}

  login(email: string, password: string) {
    return this.api.post<{ token: string; email: string; fullName: string; mustChangePassword: boolean }>(
      '/auth/login', { email, password }
    ).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('fullName', res.fullName);
        localStorage.setItem('email', res.email);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.api.post<{ token: string; email: string; fullName: string; mustChangePassword: boolean }>(
      '/auth/change-password', { currentPassword, newPassword }, true
    ).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('fullName', res.fullName);
        localStorage.setItem('email', res.email);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('email');
    this.router.navigate(['/admin/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getFullName(): string { return localStorage.getItem('fullName') ?? ''; }
  getEmail(): string { return localStorage.getItem('email') ?? ''; }

  forgotPassword(email: string) {
    return this.api.post<{ message: string }>('/auth/forgot-password', { email });
  }

  resetPassword(email: string, token: string, newPassword: string) {
    return this.api.post<{ message: string }>('/auth/reset-password', { email, token, newPassword });
  }
}
