import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

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
}

export interface CreateProduct {
  title: string;
  description: string;
  price: number;
  discountPrice: number;
  imageUrls: string[];
  variations: string[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private api: ApiService) {}

  getAll() { return this.api.get<Product[]>('/products'); }
  getById(id: string) { return this.api.get<Product>(`/products/${id}`); }
  create(data: CreateProduct) { return this.api.post<Product>('/products', data, true); }
  update(id: string, data: Partial<CreateProduct>) { return this.api.put<void>(`/products/${id}`, data); }
  delete(id: string) { return this.api.delete<void>(`/products/${id}`); }
}
