import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService, private router: Router) {}

  login(email: string, password: string) {
    return this.api.post<{ token: string; email: string }>('/auth/login', { email, password }).pipe(
      tap(res => localStorage.setItem('token', res.token))
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/admin/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  forgotPassword(email: string) {
    return this.api.post<{ message: string }>('/auth/forgot-password', { email });
  }

  resetPassword(email: string, token: string, newPassword: string) {
    return this.api.post<{ message: string }>('/auth/reset-password', { email, token, newPassword });
  }
}
