import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface InventoryMovement {
  id: string;
  reason: string;
  fulfillmentNote: string | null;
  movedBy: string;
  approvedBy: string;
  movedAt: string;
}

export interface InventoryItem {
  id: string;
  orderId: string;
  trackingToken: string;
  productTitle: string;
  variation: string | null;
  buyingPrice: number;
  notes: string | null;
  createdAt: string;
  isMoved: boolean;
  movedAt: string | null;
  movement: InventoryMovement | null;
}

export interface MoveFromInventoryPayload {
  reason: string;
  fulfillmentNote: string | null;
  approverEmail: string;
  approverPassword: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private api: ApiService) {}

  getAll() { return this.api.get<InventoryItem[]>('/inventory', true); }

  move(id: string, payload: MoveFromInventoryPayload) {
    return this.api.post<InventoryMovement>(`/inventory/${id}/move`, payload, true);
  }
}
