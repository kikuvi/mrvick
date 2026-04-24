import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private api: ApiService) {}

  getAll() { return this.api.get<Record<string, string>>('/settings'); }
  update(data: Record<string, string>) { return this.api.patch<void>('/settings', data); }
}
