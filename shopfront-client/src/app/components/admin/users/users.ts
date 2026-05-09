import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, AdminUser, CreateUser, UpdateUser } from '../../../services/user.service';

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
      background: #fff; border-radius: 12px; width: 100%; max-width: 440px;
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
    .must-change { font-size: .75rem; background: #fef3c7; color: #92400e; border-radius: 99px; padding: .15rem .6rem; font-weight: 600; }
  `],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h1>Users</h1>
        <button class="btn btn-primary" (click)="openCreate()">+ Add User</button>
      </div>

      <table class="table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of users">
            <td>{{ u.fullName || '—' }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.phoneNumber || '—' }}</td>
            <td>
              <span *ngIf="!u.isActive" style="color:#e63946;font-size:.85rem;font-weight:600">Inactive</span>
              <span *ngIf="u.isActive && u.mustChangePassword" class="must-change">Must change password</span>
              <span *ngIf="u.isActive && !u.mustChangePassword" style="color:#16a34a;font-size:.85rem">Active</span>
            </td>
            <td>
              <div style="display:flex;gap:.4rem;flex-wrap:wrap">
                <button class="btn-sm" (click)="openEdit(u)">Edit</button>
                <button class="btn-sm" (click)="openPassword(u)">Change Password</button>
                <button class="btn-sm" [class.danger]="u.isActive" (click)="toggleActive(u)">
                  {{ u.isActive ? 'Deactivate' : 'Activate' }}
                </button>
                <button class="btn-sm danger" (click)="delete(u)">Delete</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="!users.length">
            <td colspan="5" class="empty">No users found.</td>
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
          <label>Full Name
            <input type="text" placeholder="e.g. Jane Wanjiru" [(ngModel)]="newUser.fullName" name="newFullName" />
          </label>
          <label>Phone Number
            <input type="tel" placeholder="e.g. 0712345678" [(ngModel)]="newUser.phoneNumber" name="newPhone" />
          </label>
          <label>Email
            <input type="email" placeholder="user@example.com" [(ngModel)]="newUser.email" name="newEmail" />
          </label>
          <label>Temporary Password
            <input type="password" placeholder="Min 8 characters" [(ngModel)]="newUser.password" name="newPassword" />
          </label>
          <p style="margin:0;font-size:.8rem;color:#888">User will be required to change this password on first login.</p>
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

    <!-- Edit User Modal -->
    <div class="modal-overlay" *ngIf="editUser" (click)="onOverlay($event, 'edit')">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Edit User</h3>
          <button class="modal-close" (click)="editUser = null">×</button>
        </div>
        <div class="modal-body">
          <label>Full Name
            <input type="text" [(ngModel)]="editForm.fullName" name="editFullName" />
          </label>
          <label>Phone Number
            <input type="tel" [(ngModel)]="editForm.phoneNumber" name="editPhone" />
          </label>
          <label>Email
            <input type="email" [(ngModel)]="editForm.email" name="editEmail" />
          </label>
          <span class="error-msg" *ngIf="editError">{{ editError }}</span>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" style="font-size:.85rem;padding:.5rem 1.25rem" (click)="editUser = null">Cancel</button>
          <button class="btn btn-primary" style="font-size:.85rem;padding:.5rem 1.25rem" [disabled]="saving" (click)="saveEdit()">
            {{ saving ? 'Saving…' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div class="modal-overlay" *ngIf="pwUser" (click)="onOverlay($event, 'pw')">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Reset Password</h3>
          <button class="modal-close" (click)="pwUser = null">×</button>
        </div>
        <div class="modal-body">
          <p style="margin:0;color:#555;font-size:.9rem">{{ pwUser.fullName || pwUser.email }}</p>
          <label>New Password
            <input type="password" placeholder="Min 8 characters" [(ngModel)]="newPw" name="newPw" />
          </label>
          <p style="margin:0;font-size:.8rem;color:#888">User will be required to change this password on next login.</p>
          <span class="error-msg" *ngIf="pwError">{{ pwError }}</span>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" style="font-size:.85rem;padding:.5rem 1.25rem" (click)="pwUser = null">Cancel</button>
          <button class="btn btn-primary" style="font-size:.85rem;padding:.5rem 1.25rem" [disabled]="saving" (click)="changePassword()">
            {{ saving ? 'Saving…' : 'Reset Password' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  users: AdminUser[] = [];
  showCreate = false;
  newUser: CreateUser = { fullName: '', phoneNumber: '', email: '', password: '' };
  createError = '';
  pwUser: AdminUser | null = null;
  newPw = '';
  pwError = '';
  editUser: AdminUser | null = null;
  editForm: UpdateUser = { fullName: '', phoneNumber: '', email: '' };
  editError = '';
  saving = false;

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.userService.getAll().subscribe(u => { this.users = u; this.cdr.markForCheck(); });
  }

  openCreate() {
    this.newUser = { fullName: '', phoneNumber: '', email: '', password: '' };
    this.createError = '';
    this.showCreate = true;
  }

  openEdit(u: AdminUser) {
    this.editUser = u;
    this.editForm = { fullName: u.fullName, phoneNumber: u.phoneNumber ?? '', email: u.email };
    this.editError = '';
  }

  saveEdit() {
    if (!this.editUser) return;
    this.editError = '';
    this.saving = true;
    this.cdr.markForCheck();
    this.userService.update(this.editUser.id, this.editForm).subscribe({
      next: () => { this.editUser = null; this.saving = false; this.load(); },
      error: err => {
        this.editError = err.error?.error ?? 'Failed to update user.';
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  openPassword(u: AdminUser) {
    this.pwUser = u; this.newPw = ''; this.pwError = '';
  }

  create() {
    this.createError = '';
    this.saving = true;
    this.cdr.markForCheck();
    this.userService.create(this.newUser).subscribe({
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
      next: () => { this.pwUser = null; this.saving = false; this.load(); },
      error: err => {
        this.pwError = err.error?.error ?? 'Failed to update password.';
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleActive(u: AdminUser) {
    this.userService.toggleActive(u.id).subscribe({
      next: updated => { u.isActive = updated.isActive; this.cdr.markForCheck(); },
      error: err => alert(err.error?.error ?? 'Failed to update user.')
    });
  }

  delete(u: AdminUser) {
    if (!confirm(`Delete user ${u.fullName || u.email}? This cannot be undone.`)) return;
    this.userService.delete(u.id).subscribe({
      next: () => this.load(),
      error: err => alert(err.error?.error ?? 'Failed to delete user.')
    });
  }

  onOverlay(e: MouseEvent, modal: string) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      if (modal === 'create') this.showCreate = false;
      if (modal === 'edit') this.editUser = null;
      if (modal === 'pw') this.pwUser = null;
    }
  }
}
