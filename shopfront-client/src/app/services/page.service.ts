import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  metaDesc?: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class PageService {
  constructor(private api: ApiService) {}

  getBySlug(slug: string) { return this.api.get<Page>(`/pages/${slug}`); }
  update(slug: string, data: { title: string; content: string; metaDesc?: string }) {
    return this.api.patch<void>(`/pages/${slug}`, data);
  }
}
