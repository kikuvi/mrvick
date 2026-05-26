import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService, AppRole, PermissionInfo } from '../../../services/permission.service';
import { UserService, AdminUser } from '../../../services/user.service';

interface RoleUser { id: string; email: string; fullName: string; }

interface PermGroup { group: string; perms: PermissionInfo[] }

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page { display: flex; gap: 24px; height: 100%; }
    .panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .panel-header { padding: 16px 20px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; }
    .panel-header h3 { margin: 0; font-size: 15px; font-weight: 700; color: #1a1a1a; }
    .roles-panel { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; }
    .detail-panel { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .role-list { flex: 1; overflow-y: auto; }
    .role-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; cursor: pointer; border-bottom: 1px solid #f9f9f9; transition: background .1s; }
    .role-item:hover { background: #f8f9ff; }
    .role-item.active { background: #eef2ff; border-right: 3px solid #4f46e5; }
    .role-name { font-size: 14px; font-weight: 600; color: #1a1a1a; }
    .role-meta { font-size: 11px; color: #888; margin-top: 2px; }
    .role-actions { display: flex; gap: 6px; opacity: 0; transition: opacity .15s; }
    .role-item:hover .role-actions { opacity: 1; }
    .btn-icon { background: none; border: none; cursor: pointer; padding: 4px 6px; border-radius: 6px; font-size: 13px; }
    .btn-icon.del:hover { background: #fee2e2; color: #dc2626; }
    .btn-icon.edit:hover { background: #f0f4ff; color: #4f46e5; }
    .btn-sm { padding: 7px 14px; font-size: 13px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn-primary { background: #4f46e5; color: #fff; }
    .btn-primary:hover { background: #4338ca; }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .btn-outline { background: #fff; border: 1px solid #d1d5db; color: #374151; }
    .btn-outline:hover { background: #f9fafb; }
    .empty-state { padding: 40px 20px; text-align: center; color: #aaa; font-size: 13px; }
    .detail-content { flex: 1; overflow-y: auto; padding: 20px; }
    .tabs { display: flex; gap: 0; border-bottom: 1px solid #e5e7eb; padding: 0 20px; }
    .tab-btn { padding: 12px 16px; font-size: 13px; font-weight: 600; border: none; background: none; cursor: pointer; color: #6b7280; border-bottom: 2px solid transparent; margin-bottom: -1px; }
    .tab-btn.active { color: #4f46e5; border-bottom-color: #4f46e5; }
    .perm-group { margin-bottom: 20px; }
    .perm-group-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #6b7280; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    .perm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 6px; }
    .perm-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all .1s; }
    .perm-item:hover { border-color: #4f46e5; background: #f8f9ff; }
    .perm-item input[type=checkbox] { margin-top: 2px; accent-color: #4f46e5; width: 15px; height: 15px; flex-shrink: 0; }
    .perm-label { font-size: 13px; color: #374151; line-height: 1.4; }
    .perm-key { font-size: 10px; color: #aaa; font-family: monospace; }
    .select-all-link { font-size: 11px; color: #4f46e5; cursor: pointer; background: none; border: none; padding: 0; }
    .select-all-link:hover { text-decoration: underline; }
    .user-list { display: flex; flex-direction: column; gap: 8px; }
    .user-item { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 10px; }
    .user-avatar { width: 36px; height: 36px; background: #eef2ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #4f46e5; flex-shrink: 0; }
    .user-name { font-size: 13px; font-weight: 600; color: #1a1a1a; }
    .user-email { font-size: 12px; color: #888; }
    .assign-section { padding: 20px; border-top: 1px solid #f0f0f0; }
    .assign-section h4 { font-size: 13px; font-weight: 700; color: #374151; margin: 0 0 10px; }
    .user-select-row { display: flex; gap: 10px; }
    .user-select-row select { flex: 1; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal { background: #fff; border-radius: 14px; padding: 28px; width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,.15); }
    .modal h3 { margin: 0 0 20px; font-size: 16px; font-weight: 700; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .form-group input, .form-group textarea { width: 100%; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .form-group textarea { resize: vertical; min-height: 70px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .save-bar { padding: 14px 20px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; }
    .badge { background: #eef2ff; color: #4f46e5; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 20px; }
  `],
  template: `
    <div class="page">

      <!-- ── Roles list ── -->
      <div class="panel roles-panel">
        <div class="panel-header">
          <h3>Roles</h3>
          <button class="btn-sm btn-primary" (click)="openCreate()">+ New</button>
        </div>
        <div class="role-list">
          <div *ngIf="roles.length === 0" class="empty-state">No roles yet.</div>
          <div *ngFor="let r of roles"
               class="role-item" [class.active]="selected?.id === r.id"
               (click)="selectRole(r)">
            <div>
              <div class="role-name">{{ r.name }}</div>
              <div class="role-meta">{{ r.permissions.length }} permissions · {{ r.userCount }} user{{ r.userCount === 1 ? '' : 's' }}</div>
            </div>
            <div class="role-actions">
              <button class="btn-icon edit" (click)="openEdit(r, $event)" title="Edit">✏️</button>
              <button class="btn-icon del" (click)="deleteRole(r, $event)" title="Delete">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Detail panel ── -->
      <div class="panel detail-panel" *ngIf="selected; else noSelection">

        <div class="tabs">
          <button class="tab-btn" [class.active]="tab==='perms'" (click)="tab='perms'">Permissions</button>
          <button class="tab-btn" [class.active]="tab==='users'" (click)="tab='users'; loadUsers()">Users ({{ selected.userCount }})</button>
        </div>

        <!-- Permissions tab -->
        <div class="detail-content" *ngIf="tab==='perms'">
          <div *ngFor="let g of permGroups" class="perm-group">
            <div class="perm-group-title">
              {{ g.group }}
              <button class="select-all-link" (click)="toggleGroup(g)">
                {{ groupAllSelected(g) ? 'Deselect all' : 'Select all' }}
              </button>
            </div>
            <div class="perm-grid">
              <label *ngFor="let p of g.perms" class="perm-item">
                <input type="checkbox" [checked]="selectedPerms.has(p.key)" (change)="togglePerm(p.key)" />
                <div>
                  <div class="perm-label">{{ p.label }}</div>
                  <div class="perm-key">{{ p.key }}</div>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div class="save-bar" *ngIf="tab==='perms'">
          <button class="btn-sm btn-primary" [disabled]="savingPerms" (click)="savePermissions()">
            {{ savingPerms ? 'Saving…' : 'Save Permissions' }}
          </button>
        </div>

        <!-- Users tab -->
        <div class="detail-content" *ngIf="tab==='users'">
          <div *ngIf="loadingUsers" style="color:#aaa;font-size:13px">Loading…</div>
          <div class="user-list" *ngIf="!loadingUsers">
            <div *ngIf="roleUsers.length === 0" style="color:#aaa;font-size:13px;padding:20px 0">No users have this role.</div>
            <div *ngFor="let u of roleUsers" class="user-item">
              <div class="user-avatar">{{ initials(u.fullName || u.email) }}</div>
              <div>
                <div class="user-name">{{ u.fullName }}</div>
                <div class="user-email">{{ u.email }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="assign-section" *ngIf="tab==='users'">
          <h4>Assign user to this role</h4>
          <div class="user-select-row">
            <select [(ngModel)]="assignUserId">
              <option value="">— select user —</option>
              <option *ngFor="let u of allUsers" [value]="u.id">{{ u.fullName }} ({{ u.email }})</option>
            </select>
            <button class="btn-sm btn-primary" [disabled]="!assignUserId || assigning" (click)="assignUser()">
              {{ assigning ? '…' : 'Assign' }}
            </button>
          </div>
        </div>
      </div>

      <ng-template #noSelection>
        <div class="panel detail-panel" style="display:flex;align-items:center;justify-content:center;">
          <div class="empty-state">Select a role to manage its permissions and users.</div>
        </div>
      </ng-template>
    </div>

    <!-- Create / Edit modal -->
    <div class="modal-backdrop" *ngIf="modal" (click)="modal=null">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>{{ modal === 'create' ? 'New Role' : 'Edit Role' }}</h3>
        <div class="form-group">
          <label>Name *</label>
          <input [(ngModel)]="form.name" placeholder="e.g. Finance Manager" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="form.description" placeholder="Optional description…"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-sm btn-outline" (click)="modal=null">Cancel</button>
          <button class="btn-sm btn-primary" [disabled]="!form.name.trim() || saving" (click)="saveRole()">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminRolesComponent implements OnInit {
  roles: AppRole[] = [];
  selected: AppRole | null = null;
  tab: 'perms' | 'users' = 'perms';

  allPermissions: PermissionInfo[] = [];
  permGroups: PermGroup[] = [];
  selectedPerms = new Set<string>();
  savingPerms = false;

  roleUsers: RoleUser[] = [];
  allUsers: AdminUser[] = [];
  assignUserId = '';
  assigning = false;
  loadingUsers = false;

  modal: 'create' | 'edit' | null = null;
  form = { name: '', description: '' };
  editingId: string | null = null;
  saving = false;

  error = '';

  constructor(
    private perm: PermissionService,
    private userSvc: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.perm.getAllPermissions().subscribe(perms => {
      this.allPermissions = perms;
      this.permGroups = this.buildGroups(perms);
      this.cdr.markForCheck();
    });
    this.userSvc.getAll().subscribe(users => {
      this.allUsers = users.filter(u => u.isActive);
      this.cdr.markForCheck();
    });
    this.loadRoles();
  }

  loadRoles() {
    this.perm.getRoles().subscribe(roles => {
      this.roles = roles;
      if (this.selected) {
        this.selected = roles.find(r => r.id === this.selected!.id) ?? null;
      }
      this.cdr.markForCheck();
    });
  }

  selectRole(role: AppRole) {
    this.selected = role;
    this.tab = 'perms';
    this.selectedPerms = new Set(role.permissions);
    this.cdr.markForCheck();
  }

  togglePerm(key: string) {
    if (this.selectedPerms.has(key)) this.selectedPerms.delete(key);
    else this.selectedPerms.add(key);
    this.cdr.markForCheck();
  }

  toggleGroup(g: PermGroup) {
    const allSelected = this.groupAllSelected(g);
    g.perms.forEach(p => allSelected ? this.selectedPerms.delete(p.key) : this.selectedPerms.add(p.key));
    this.cdr.markForCheck();
  }

  groupAllSelected(g: PermGroup) {
    return g.perms.every(p => this.selectedPerms.has(p.key));
  }

  savePermissions() {
    if (!this.selected) return;
    this.savingPerms = true;
    this.perm.setRolePermissions(this.selected.id, [...this.selectedPerms]).subscribe({
      next: () => {
        this.savingPerms = false;
        this.loadRoles();
        this.cdr.markForCheck();
      },
      error: () => { this.savingPerms = false; this.cdr.markForCheck(); }
    });
  }

  loadUsers() {
    if (!this.selected) return;
    this.loadingUsers = true;
    this.perm.getRoleUsers(this.selected.id).subscribe(users => {
      this.roleUsers = users;
      this.loadingUsers = false;
      this.cdr.markForCheck();
    });
  }

  assignUser() {
    if (!this.selected || !this.assignUserId) return;
    this.assigning = true;
    // Get user's current roles then add this one
    this.perm.getUserRoles(this.assignUserId).subscribe(currentRoles => {
      const roleIds = [...currentRoles.map(r => r.id), this.selected!.id];
      const uniqueRoleIds = [...new Set(roleIds)];
      this.perm.setUserRoles(this.assignUserId, uniqueRoleIds).subscribe({
        next: () => {
          this.assigning = false;
          this.assignUserId = '';
          this.loadUsers();
          this.loadRoles();
          this.cdr.markForCheck();
        },
        error: () => { this.assigning = false; this.cdr.markForCheck(); }
      });
    });
  }

  openCreate() {
    this.modal = 'create';
    this.form = { name: '', description: '' };
    this.editingId = null;
  }

  openEdit(role: AppRole, e: Event) {
    e.stopPropagation();
    this.modal = 'edit';
    this.form = { name: role.name, description: role.description ?? '' };
    this.editingId = role.id;
  }

  saveRole() {
    if (!this.form.name.trim()) return;
    this.saving = true;
    const data = { name: this.form.name.trim(), description: this.form.description.trim() || undefined };

    const req = this.modal === 'create'
      ? this.perm.createRole(data)
      : this.perm.updateRole(this.editingId!, data);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.modal = null;
        this.loadRoles();
        this.cdr.markForCheck();
      },
      error: () => { this.saving = false; this.cdr.markForCheck(); }
    });
  }

  deleteRole(role: AppRole, e: Event) {
    e.stopPropagation();
    if (!confirm(`Delete role "${role.name}"? Users with this role will lose its permissions.`)) return;
    this.perm.deleteRole(role.id).subscribe(() => {
      if (this.selected?.id === role.id) this.selected = null;
      this.loadRoles();
      this.cdr.markForCheck();
    });
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  private buildGroups(perms: PermissionInfo[]): PermGroup[] {
    const map = new Map<string, PermissionInfo[]>();
    perms.forEach(p => {
      const list = map.get(p.group) ?? [];
      list.push(p);
      map.set(p.group, list);
    });
    return [...map.entries()].map(([group, perms]) => ({ group, perms }));
  }
}
