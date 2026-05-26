import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  incurredBy: string;
  category: string;
  date: string;
  notes: string | null;
  status: 'Pending' | 'Settled';
  createdAt: string;
}

export interface CreateExpensePayload {
  name: string;
  amount: number;
  incurredBy: string;
  category: string;
  date: string;
  notes: string | null;
}

export interface UpdateExpensePayload extends CreateExpensePayload {
  status: 'Pending' | 'Settled';
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  constructor(private api: ApiService) {}

  getAll() { return this.api.get<Expense[]>('/expenses', true); }

  create(payload: CreateExpensePayload) {
    // Explicitly shape the body so no extra fields bleed through
    const body: CreateExpensePayload = {
      name: payload.name,
      amount: payload.amount,
      incurredBy: payload.incurredBy,
      category: payload.category,
      date: payload.date,
      notes: payload.notes || null,
    };
    return this.api.post<Expense>('/expenses', body, true);
  }

  update(id: string, payload: UpdateExpensePayload) {
    return this.api.put<Expense>(`/expenses/${id}`, payload);
  }

  updateStatus(id: string, status: 'Pending' | 'Settled') {
    return this.api.patch<{ id: string; status: string }>(`/expenses/${id}/status`, { status });
  }

  delete(id: string) { return this.api.delete<void>(`/expenses/${id}`); }
}
