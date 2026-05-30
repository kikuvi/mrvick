import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
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
  // Origin of the shopfront server — used to rewrite relative image URLs
  private shopfrontOrigin = new URL(environment.shopfrontApiUrl).origin;

  constructor(private api: ApiService, private http: HttpClient) {}

  private fixUrls(p: Product): Product {
    return { ...p, imageUrls: p.imageUrls.map(u => u.startsWith('/') ? `${this.shopfrontOrigin}${u}` : u) };
  }

  getAll() {
    return this.http.get<Product[]>(`${this.shopfrontBase}/products`).pipe(map(ps => ps.map(p => this.fixUrls(p))));
  }
  getById(id: string) {
    return this.http.get<Product>(`${this.shopfrontBase}/products/${id}`).pipe(map(p => this.fixUrls(p)));
  }

  getAllAdmin() { return this.api.get<Product[]>('/products/all', true); }
  toggleActive(id: string) { return this.api.patch<{ isActive: boolean }>(`/products/${id}/toggle-active`, {}); }
  create(data: CreateProduct) { return this.api.post<Product>('/products', data, true); }
  update(id: string, data: Partial<CreateProduct>) { return this.api.put<void>(`/products/${id}`, data); }
  delete(id: string) { return this.api.delete<void>(`/products/${id}`); }
}
