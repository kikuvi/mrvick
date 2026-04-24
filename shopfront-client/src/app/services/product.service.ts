import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPrice: number;
  createdAt: string;
  imageUrls: string[];
}

export interface CreateProduct {
  title: string;
  description: string;
  price: number;
  discountPrice: number;
  imageUrls: string[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private api: ApiService) {}

  getAll() { return this.api.get<Product[]>('/products'); }
  getById(id: number) { return this.api.get<Product>(`/products/${id}`); }
  create(data: CreateProduct) { return this.api.post<Product>('/products', data, true); }
  update(id: number, data: Partial<CreateProduct>) { return this.api.put<void>(`/products/${id}`, data); }
  delete(id: number) { return this.api.delete<void>(`/products/${id}`); }
}
