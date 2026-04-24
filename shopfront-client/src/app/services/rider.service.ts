import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Rider {
  id: string;
  name: string;
  phone: string;
  county: string;
  localTown: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class RiderService {
  constructor(private api: ApiService) {}

  getAll() { return this.api.get<Rider[]>('/riders', true); }
  create(data: Omit<Rider, 'id' | 'createdAt'>) { return this.api.post<Rider>('/riders', data, true); }
  delete(id: string) { return this.api.delete<void>(`/riders/${id}`); }
}
