import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface HourlyAnalytics {
  labels: string[];
  total: number[];
  new: number[];
  assigned: number[];
  completed: number[];
  deliverLater: number[];
  dispatchToday: number[];
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private api: ApiService) {}

  getHourly() { return this.api.get<HourlyAnalytics>('/orders/analytics/hourly', true); }
}
