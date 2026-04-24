import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, AdminUser } from '../../../services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 300; padding: 1rem;
    }
    .modal {
      background: #fff; border-radius: 12px; width: 100%; max-width: 420px;
      box-shadow: 0 12px 48px rgba(0,0,0,.22); overflow: hidden;
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.1rem 1.4rem; background: #1d3557; color: #fff;
    }
    .modal-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
    .modal-close {
      width: 30px; height: 30px; border-radius: 50%; border: none;
      background: rgba(255,255,255,.15); color: #fff; cursor: pointer;
      font-size: 1.1rem; display: flex; align-items: center; justify-content: center;
    }
    .modal-close:hover { background: rgba(255,255,255,.3); }
    .modal-body { padding: 1.4rem; display: flex; flex-direction: column; gap: .75rem; }
    .modal-body label { display: flex; flex-direction: column; gap: .3rem; font-size: .85rem; font-weight: 600; color: #555; }
    .modal-body input { padding: .65rem .9rem; border: 1px solid #ddd; border-radius: 6px; font-size: .95rem; }
    .modal-body input:focus { outline: none; border-color: #1d3557; box-shadow: 0 0 0 3px rgba(29,53,87,.1); }
    .modal-footer { padding: .9rem 1.4rem; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: .6rem; }
    .error-msg { color: #e63946; font-size: .85rem; }
  `],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h1>Users</h1>
        <button class="btn btn-primary" (click)="openCreate()">+ Add User</button>
      </div>

      <table class="table">
        <thead>
          <tr><th>Email</th><th>Confirmed</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of users">
            <td>{{ u.email }}</td>
            <td>{{ u.emailConfirmed ? 'Yes' : 'No' }}</td>
            <td>
              <div style="display:flex;gap:.4rem;flex-wrap:wrap">
                <button class="btn-sm" (click)="openPassword(u)">Change Password</button>
                <button class="btn-sm danger" (click)="delete(u)">Delete</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="!users.length">
            <td colspan="3" class="empty">No users found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create User Modal -->
    <div class="modal-overlay" *ngIf="showCreate" (click)="onOverlay($event, 'create')">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Add User</h3>
          <button class="modal-close" (click)="showCreate = false">×</button>
        </div>
        <div class="modal-body">
          <label>Email
            <input type="email" placeholder="user@example.com" [(ngModel)]="newEmail" name="newEmail" />
          </label>
          <label>Password
            <input type="password" placeholder="Min 8 characters" [(ngModel)]="newPassword" name="newPassword" />
          </label>
          <span class="error-msg" *ngIf="createError">{{ createError }}</span>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" style="font-size:.85rem;padding:.5rem 1.25rem" (click)="showCreate = false">Cancel</button>
          <button class="btn btn-primary" style="font-size:.85rem;padding:.5rem 1.25rem" [disabled]="saving" (click)="create()">
            {{ saving ? 'Creating…' : 'Create User' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div class="modal-overlay" *ngIf="pwUser" (click)="onOverlay($event, 'pw')">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Change Password</h3>
          <button class="modal-close" (click)="pwUser = null">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:0;color:#555;font-size:.9rem">{{ pwUser.email }}</p>
          <label>New Password
            <input type="password" placeholder="Min 8 characters" [(ngModel)]="newPw" name="newPw" />
          </label>
          <span class="error-msg" *ngIf="pwError">{{ pwError }}</span>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" style="font-size:.85rem;padding:.5rem 1.25rem" (click)="pwUser = null">Cancel</button>
          <button class="btn btn-primary" style="font-size:.85rem;padding:.5rem 1.25rem" [disabled]="saving" (click)="changePassword()">
            {{ saving ? 'Saving…' : 'Save Password' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  users: AdminUser[] = [];
  showCreate = false;
  newEmail = '';
  newPassword = '';
  createError = '';
  pwUser: AdminUser | null = null;
  newPw = '';
  pwError = '';
  saving = false;

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.userService.getAll().subscribe(u => { this.users = u; this.cdr.markForCheck(); });
  }

  openCreate() {
    this.newEmail = ''; this.newPassword = ''; this.createError = '';
    this.showCreate = true;
  }

  openPassword(u: AdminUser) {
    this.pwUser = u; this.newPw = ''; this.pwError = '';
  }

  create() {
    this.createError = '';
    this.saving = true;
    this.cdr.markForCheck();
    this.userService.create(this.newEmail, this.newPassword).subscribe({
      next: () => { this.showCreate = false; this.saving = false; this.load(); },
      error: err => {
        this.createError = err.error?.error ?? 'Failed to create user.';
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  changePassword() {
    if (!this.pwUser) return;
    this.pwError = '';
    this.saving = true;
    this.cdr.markForCheck();
    this.userService.updatePassword(this.pwUser.id, this.newPw).subscribe({
      next: () => { this.pwUser = null; this.saving = false; this.cdr.markForCheck(); },
      error: err => {
        this.pwError = err.error?.error ?? 'Failed to update password.';
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  delete(u: AdminUser) {
    if (!confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
    this.userService.delete(u.id).subscribe({
      next: () => this.load(),
      error: err => alert(err.error?.error ?? 'Failed to delete user.')
    });
  }

  onOverlay(e: MouseEvent, modal: string) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      if (modal === 'create') this.showCreate = false;
      if (modal === 'pw') this.pwUser = null;
    }
  }
}
