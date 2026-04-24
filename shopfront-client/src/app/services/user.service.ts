import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface AdminUser {
  id: string;
  email: string;
  emailConfirmed: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  getAll() { return this.api.get<AdminUser[]>('/users', true); }
  create(email: string, password: string) { return this.api.post<AdminUser>('/users', { email, password }, true); }
  updatePassword(id: string, newPassword: string) { return this.api.put<void>(`/users/${id}/password`, { newPassword }); }
  delete(id: string) { return this.api.delete<void>(`/users/${id}`); }
}
