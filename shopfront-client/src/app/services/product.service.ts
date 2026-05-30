import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

export interface ProductVariation {
  id: string;
  label: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice: number;
  createdAt: string;
  imageUrls: string[];
  variations: ProductVariation[];
  ratingsEnabled: boolean;
  averageRating: number;
  ratingCount: number;
  isActive: boolean;
}

export interface CreateProduct {
  title: string;
  description: string;
  price: number;
  discountPrice: number;
  imageUrls: string[];
  variations: string[];
  ratingsEnabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private shopfrontBase = environment.shopfrontApiUrl;

  constructor(private api: ApiService, private http: HttpClient) {}

  getAll() { return this.http.get<Product[]>(`${this.shopfrontBase}/products`); }
  getById(id: string) { return this.http.get<Product>(`${this.shopfrontBase}/products/${id}`); }

  getAllAdmin() { return this.api.get<Product[]>('/products/all', true); }
  toggleActive(id: string) { return this.api.patch<{ isActive: boolean }>(`/products/${id}/toggle-active`, {}); }
  create(data: CreateProduct) { return this.api.post<Product>('/products', data, true); }
  update(id: string, data: Partial<CreateProduct>) { return this.api.put<void>(`/products/${id}`, data); }
  delete(id: string) { return this.api.delete<void>(`/products/${id}`); }
}
