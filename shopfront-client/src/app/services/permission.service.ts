import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface PermissionInfo {
  key: string;
  label: string;
  group: string;
}

export interface AppRole {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  userCount: number;
  createdAt: string;
}

export interface CreateRole {
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(private api: ApiService) {}

  // ── Permissions ────────────────────────────────────────────────────────────
  getAllPermissions() {
    return this.api.get<PermissionInfo[]>('/permissions/all', true);
  }

  // ── Roles ──────────────────────────────────────────────────────────────────
  getRoles() {
    return this.api.get<AppRole[]>('/roles', true);
  }

  createRole(data: CreateRole) {
    return this.api.post<AppRole>('/roles', data, true);
  }

  updateRole(id: string, data: CreateRole) {
    return this.api.put<AppRole>(`/roles/${id}`, data);
  }

  deleteRole(id: string) {
    return this.api.delete<void>(`/roles/${id}`);
  }

  // ── Role Permissions ───────────────────────────────────────────────────────
  getRolePermissions(roleId: string) {
    return this.api.get<string[]>(`/roles/${roleId}/permissions`, true);
  }

  setRolePermissions(roleId: string, permissions: string[]) {
    return this.api.put<string[]>(`/roles/${roleId}/permissions`, { permissions });
  }

  // ── User Roles ─────────────────────────────────────────────────────────────
  /** Get roles assigned to a specific user */
  getUserRoles(userId: string) {
    return this.api.get<{ id: string; name: string; description: string | null }[]>(`/roles/users/${userId}`, true);
  }

  /** Set (replace) all roles for a specific user */
  setUserRoles(userId: string, roleIds: string[]) {
    return this.api.put<string[]>(`/roles/users/${userId}`, { roleIds });
  }

  /** Get users who have a specific role */
  getRoleUsers(roleId: string) {
    return this.api.get<{ id: string; email: string; fullName: string }[]>(`/roles/${roleId}/users`, true);
  }
}
