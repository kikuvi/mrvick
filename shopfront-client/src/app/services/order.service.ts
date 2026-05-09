import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface PlaceOrder {
  productId: string;
  productTitle: string;
  customerName: string;
  phone: string;
  email?: string;
  county: string;
  deliveryAddress: string;
  variation?: string;
}

export interface Order {
  id: string;
  trackingToken: string;
  customerName: string;
  phone: string;
  email?: string;
  county: string;
  deliveryAddress: string;
  priceAtOrder: number;
  buyingPrice: number;
  advertisingCost: number;
  deliveryFee: number;
  profit: number;
  status: string;
  productId: string;
  productTitle: string;
  riderId?: string;
  riderName?: string;
  createdAt: string;
  variation?: string;
  isArchived: boolean;
}

export interface TrackOrder {
  trackingToken: string;
  customerName: string;
  county: string;
  deliveryAddress: string;
  priceAtOrder: number;
  status: string;
  productTitle: string;
  riderName?: string;
  createdAt: string;
  variation?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private api: ApiService) {}

  place(data: PlaceOrder) { return this.api.post<{ trackingToken: string }>('/orders', data); }
  track(token: string) { return this.api.get<TrackOrder>(`/orders/track/${token}`); }
  getAll() { return this.api.get<Order[]>('/orders', true); }
  getArchived() { return this.api.get<Order[]>('/orders?archived=true', true); }
  archive(id: string) { return this.api.patch<void>(`/orders/${id}/archive`, {}); }
  updateStatus(id: string, status: string) { return this.api.patch<void>(`/orders/${id}/status`, { status }); }
  assignRider(id: string, riderId: string) { return this.api.patch<void>(`/orders/${id}/assign`, { riderId }); }
  updateExpenses(id: string, buyingPrice: number, advertisingCost: number, deliveryFee: number) {
    return this.api.patch<void>(`/orders/${id}/expenses`, { buyingPrice, advertisingCost, deliveryFee });
  }
}
