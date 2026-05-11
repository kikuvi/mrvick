import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PageViewRow {
  path: string;
  date: string;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class PageViewService {
  constructor(private api: ApiService) {}

  track(path: string): void {
    this.api.post<void>('/page-views', { path }).subscribe({ error: () => {} });
  }

  getReport(days = 30): Observable<PageViewRow[]> {
    return this.api.get<PageViewRow[]>(`/page-views/report?days=${days}`, true);
  }
}
