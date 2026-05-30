import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

export interface PlaceOrder {
  productId: string;
  productTitle: string;
  customerName: string;
  phone: string;
  email?: string;
  county: string;
  deliveryAddress: string;
  variation?: string;
  leadEventId?: string;
  purchaseEventId?: string;
  eventSourceUrl?: string;
  fbp?: string;
  fbc?: string;
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
  courierId?: string;
  courierName?: string;
  createdAt: string;
  variation?: string;
  isArchived: boolean;
  deliveryDate?: string;
}

export interface OrderNote {
  id: string;
  content: string;
  createdBy: string | null;
  createdAt: string;
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
  private shopfrontBase = environment.shopfrontApiUrl;

  constructor(private api: ApiService, private http: HttpClient) {}

  place(data: PlaceOrder) {
    return this.http.post<{ trackingToken: string }>(`${this.shopfrontBase}/orders`, { ...data, source: 'mrvick' });
  }
  track(token: string) { return this.http.get<TrackOrder>(`${this.shopfrontBase}/orders/track/${token}`); }
  getAll() { return this.api.get<Order[]>('/orders', true); }
  getArchived() { return this.api.get<Order[]>('/orders?archived=true', true); }
  archive(id: string) { return this.api.patch<void>(`/orders/${id}/archive`, {}); }
  updateStatus(id: string, status: string, deliveryDate?: string) {
    const body: Record<string, unknown> = { status };
    if (deliveryDate) body['deliveryDate'] = deliveryDate;
    return this.api.patch<void>(`/orders/${id}/status`, body);
  }
  assignRider(id: string, riderId: string) { return this.api.patch<void>(`/orders/${id}/assign`, { riderId }); }
  assignCourier(id: string, courierId: string) { return this.api.patch<void>(`/orders/${id}/assign-courier`, { courierId }); }
  updateExpenses(id: string, buyingPrice: number, advertisingCost: number, deliveryFee: number) {
    return this.api.patch<void>(`/orders/${id}/expenses`, { buyingPrice, advertisingCost, deliveryFee });
  }
  getNotes(id: string) { return this.api.get<OrderNote[]>(`/orders/${id}/notes`, true); }
  addNote(id: string, content: string) { return this.api.post<OrderNote>(`/orders/${id}/notes`, { content }, true); }
}
