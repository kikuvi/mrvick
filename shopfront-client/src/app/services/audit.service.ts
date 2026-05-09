import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface AuditLogItem {
  id: number;
  action: string;
  userEmail: string | null;
  entityType: string | null;
  entityId: string | null;
  details: string | null;
  createdAt: string;
}

export interface AuditLogPage {
  total: number;
  items: AuditLogItem[];
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private api: ApiService) {}

  getAll(page = 1, pageSize = 50) {
    return this.api.get<AuditLogPage>(`/audit-logs?page=${page}&pageSize=${pageSize}`, true);
  }
}
