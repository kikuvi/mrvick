import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';
import { OrderService, TrackOrder } from '../../../services/order.service';

const STATUS_STEPS = ['New', 'Assigned', 'InTransit', 'Delivered'];

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar />
    <div style="min-height:calc(100vh - 64px);display:flex;flex-direction:column;">
    <div class="container page-content" style="flex:1;">
      <h1>Track Order</h1>

      <div class="track-card" *ngIf="order">
        <div class="token">Order #{{ order.trackingToken }}</div>

        <div class="status-timeline">
          <div class="step" *ngFor="let step of steps"
               [class.done]="isDone(step)"
               [class.current]="isCurrent(step)">
            <div class="dot"></div>
            <span>{{ stepLabel(step) }}</span>
          </div>
        </div>

        <div class="order-summary">
          <h3>Order Summary</h3>
          <p><strong>Product:</strong> {{ order.productTitle }}</p>
          <p><strong>Customer:</strong> {{ order.customerName }}</p>
          <p><strong>Delivery:</strong> {{ order.deliveryAddress }}, {{ order.county }}</p>
          <p><strong>Amount:</strong> KES {{ order.priceAtOrder | number:'1.0-0' }}</p>
          <p *ngIf="order.riderName"><strong>Rider:</strong> {{ order.riderName }}</p>
        </div>

        <div class="rejected-notice" *ngIf="order.status === 'Rejected'">
          Your order could not be fulfilled. Please contact us for assistance.
        </div>
      </div>

      <p class="error" *ngIf="error">Order not found. Please check your tracking code.</p>
    </div>
    </div>
    <app-footer />
    </div>
  `
})
export class TrackOrderComponent implements OnInit {
  order: TrackOrder | null = null;
  error = false;
  steps = STATUS_STEPS;

  constructor(private route: ActivatedRoute, private orderService: OrderService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token')!;
    this.orderService.track(token).subscribe({
      next: o => { this.order = o; this.cdr.markForCheck(); },
      error: () => { this.error = true; this.cdr.markForCheck(); }
    });
  }

  stepIndex(status: string): number {
    return STATUS_STEPS.indexOf(status);
  }

  isDone(step: string): boolean {
    return this.order ? this.stepIndex(this.order.status) > this.stepIndex(step) : false;
  }

  isCurrent(step: string): boolean {
    return this.order?.status === step;
  }

  stepLabel(step: string): string {
    const labels: Record<string, string> = {
      New: 'Order Placed', Assigned: 'Rider Assigned',
      InTransit: 'In Transit', Delivered: 'Delivered'
    };
    return labels[step] || step;
  }
}
