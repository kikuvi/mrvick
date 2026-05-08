import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface VendorItem {
  id: string;
  itemName: string;
  vendor: string;
  location: string;
  price: number;
  contacts: string;
  createdAt: string;
}

export interface SaveVendorItem {
  itemName: string;
  vendor: string;
  location: string;
  price: number;
  contacts: string;
}

@Injectable({ providedIn: 'root' })
export class VendorItemService {
  constructor(private api: ApiService) {}

  getAll()                          { return this.api.get<VendorItem[]>('/vendoritems', true); }
  create(data: SaveVendorItem)      { return this.api.post<VendorItem>('/vendoritems', data, true); }
  update(id: string, data: SaveVendorItem) { return this.api.put<void>(`/vendoritems/${id}`, data); }
  delete(id: string)                { return this.api.delete<void>(`/vendoritems/${id}`); }
}
