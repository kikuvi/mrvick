import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface DailyAnalytics {
  labels: string[];
  total: number[];
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private api: ApiService) {}

  getDaily() { return this.api.get<DailyAnalytics>('/orders/analytics/daily', true); }
}
