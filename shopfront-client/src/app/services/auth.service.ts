import { Injectable, NgZone } from '@angular/core';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

const INACTIVITY_MS = 60 * 60 * 1000; // 1 hour

const ACTIVITY_EVENTS: (keyof DocumentEventMap)[] = [
  'mousemove', 'mousedown', 'keydown', 'touchstart', 'click', 'scroll', 'wheel'
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private activityHandler = () => this.resetInactivityTimer();

  constructor(private api: ApiService, private router: Router, private ngZone: NgZone) {}

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
    this.stopInactivityWatch();
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

  // ── Inactivity watch ──────────────────────────────────────────────────────

  /** Start watching for inactivity. Call from AdminLayoutComponent.ngOnInit(). */
  startInactivityWatch(): void {
    // Run outside Angular zone so mouse/scroll events don't trigger change detection
    this.ngZone.runOutsideAngular(() => {
      ACTIVITY_EVENTS.forEach(ev =>
        document.addEventListener(ev, this.activityHandler, { passive: true })
      );
    });
    this.resetInactivityTimer();
  }

  /** Stop watching. Call from AdminLayoutComponent.ngOnDestroy(). */
  stopInactivityWatch(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    ACTIVITY_EVENTS.forEach(ev =>
      document.removeEventListener(ev, this.activityHandler)
    );
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    // Re-enter Angular zone for the timeout callback so routing works
    this.inactivityTimer = setTimeout(() => {
      this.ngZone.run(() => this.logout());
    }, INACTIVITY_MS);
  }
}
