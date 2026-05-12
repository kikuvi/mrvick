import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Courier {
  id: string;
  name: string;
  createdAt: string;
}

export interface CourierOffice {
  id: string;
  courierId: string;
  courierName: string;
  office: string;
  phone: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CourierService {
  constructor(private api: ApiService) {}

  getAll() { return this.api.get<Courier[]>('/couriers', true); }
  create(name: string) { return this.api.post<Courier>('/couriers', { name }, true); }
  delete(id: string) { return this.api.delete<void>(`/couriers/${id}`); }

  getOffices() { return this.api.get<CourierOffice[]>('/couriers/offices', true); }
  createOffice(courierId: string, office: string, phone: string) {
    return this.api.post<CourierOffice>('/couriers/offices', { courierId, office, phone }, true);
  }
  deleteOffice(id: string) { return this.api.delete<void>(`/couriers/offices/${id}`); }
}
