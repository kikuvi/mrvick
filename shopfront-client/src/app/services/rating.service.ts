import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Rating {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  productId: string;
  productTitle: string;
}

export interface SubmitRating {
  customerName: string;
  rating: number;
  comment: string;
}

@Injectable({ providedIn: 'root' })
export class RatingService {
  constructor(private api: ApiService) {}

  getForProduct(productId: string) {
    return this.api.get<Rating[]>(`/products/${productId}/ratings`);
  }

  submit(productId: string, data: SubmitRating) {
    return this.api.post<{ message: string }>(`/products/${productId}/ratings`, data);
  }

  getAll(approved?: boolean) {
    const params = approved !== undefined ? `?approved=${approved}` : '';
    return this.api.get<Rating[]>(`/ratings${params}`, true);
  }

  approve(id: string) {
    return this.api.patch<void>(`/ratings/${id}/approve`, {});
  }

  delete(id: string) {
    return this.api.delete<void>(`/ratings/${id}`);
  }
}
