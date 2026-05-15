import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  orderId: string | null;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private unread$ = new BehaviorSubject<number>(0);
  private items$ = new BehaviorSubject<AppNotification[]>([]);
  private pollSub?: Subscription;

  unreadCount$ = this.unread$.asObservable();
  notifications$ = this.items$.asObservable();

  constructor(private api: ApiService) {}

  startPolling() {
    if (this.pollSub) return;
    this.pollSub = interval(30_000).pipe(
      startWith(0),
      switchMap(() => this.api.get<{ items: AppNotification[]; unreadCount: number }>('/notifications', true))
    ).subscribe(res => {
      this.items$.next(res.items);
      this.unread$.next(res.unreadCount);
    });
  }

  stopPolling() {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  markRead(id: string) {
    return this.api.patch<void>(`/notifications/${id}/read`, {});
  }

  markAllRead() {
    return this.api.patch<void>('/notifications/read-all', {});
  }

  refresh() {
    this.api.get<{ items: AppNotification[]; unreadCount: number }>('/notifications', true)
      .subscribe(res => {
        this.items$.next(res.items);
        this.unread$.next(res.unreadCount);
      });
  }

  ngOnDestroy() { this.stopPolling(); }
}
