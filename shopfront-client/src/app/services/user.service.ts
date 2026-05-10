import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  emailConfirmed: boolean;
  mustChangePassword: boolean;
  isActive: boolean;
}

export interface CreateUser {
  email: string;
  fullName: string;
  phoneNumber: string;
}

export interface UpdateUser {
  fullName: string;
  phoneNumber: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  getAll() { return this.api.get<AdminUser[]>('/users', true); }
  create(data: CreateUser) { return this.api.post<AdminUser>('/users', data, true); }
  update(id: string, data: UpdateUser) { return this.api.put<AdminUser>(`/users/${id}`, data); }
  toggleActive(id: string) { return this.api.patch<AdminUser>(`/users/${id}/toggle-active`, {}); }
  updatePassword(id: string, newPassword: string) { return this.api.put<void>(`/users/${id}/password`, { newPassword }); }
  delete(id: string) { return this.api.delete<void>(`/users/${id}`); }
}
