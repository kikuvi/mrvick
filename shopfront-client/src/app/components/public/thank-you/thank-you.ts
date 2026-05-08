import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';
import { PageService } from '../../../services/page.service';
import { OrderService } from '../../../services/order.service';
import { PixelService } from '../../../services/pixel.service';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar />

    <div class="ty-page">
      <div class="ty-card">
        <div class="ty-icon">🎉</div>
        <h1>{{ pageTitle }}</h1>
        <p class="ty-name" *ngIf="customerName">Hi <strong>{{ customerName }}</strong>, your order has been placed!</p>

        <div class="ty-cms" *ngIf="safeContent" [innerHTML]="safeContent"></div>

        <div class="ty-token-wrap" *ngIf="trackingToken">
          <p class="ty-token-label">Your Tracking Code</p>
          <div class="ty-token">{{ trackingToken }}</div>
          <a [routerLink]="['/track', trackingToken]" class="ty-track-btn">Track My Order</a>
        </div>

        <a routerLink="/" class="ty-home-link">Continue Shopping</a>
      </div>
    </div>

    <app-footer />
  `,
  styles: [`
    .ty-page {
      min-height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: #f9fafb;
    }
    .ty-card {
      background: #fff;
      border-radius: 1rem;
      box-shadow: 0 4px 24px rgba(0,0,0,.08);
      padding: 3rem 2rem;
      max-width: 480px;
      width: 100%;
      text-align: center;
    }
    .ty-icon { font-size: 4rem; margin-bottom: 1rem; }
    .ty-card h1 { font-size: 2rem; margin: 0 0 .75rem; color: #111; }
    .ty-name { font-size: 1.1rem; color: #374151; margin-bottom: .5rem; }
    .ty-cms { color: #6b7280; margin-bottom: 2rem; line-height: 1.6; }
    .ty-token-wrap { margin-bottom: 2rem; }
    .ty-token-label { font-size: .85rem; text-transform: uppercase; letter-spacing: .05em; color: #9ca3af; margin-bottom: .5rem; }
    .ty-token {
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: .15em;
      background: #f3f4f6;
      border-radius: .5rem;
      padding: .75rem 1.5rem;
      display: inline-block;
      margin-bottom: 1rem;
      color: #111;
    }
    .ty-track-btn {
      display: inline-block;
      background: #16a34a;
      color: #fff;
      padding: .75rem 2rem;
      border-radius: .5rem;
      text-decoration: none;
      font-weight: 600;
      transition: background .2s;
    }
    .ty-track-btn:hover { background: #15803d; }
    .ty-home-link {
      display: block;
      margin-top: 1.5rem;
      color: #6b7280;
      text-decoration: underline;
      font-size: .9rem;
    }
  `]
})
export class ThankYouComponent implements OnInit {
  customerName = '';
  trackingToken = '';
  pageTitle = 'Thank You!';
  safeContent: SafeHtml = '';

  constructor(
    private route: ActivatedRoute,
    private pageService: PageService,
    private orderService: OrderService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private pixel: PixelService
  ) {}

  ngOnInit() {
    this.pixel.init();
    this.trackingToken = this.route.snapshot.paramMap.get('token') ?? '';
    this.customerName = this.route.snapshot.queryParamMap.get('name') ?? '';

    this.pageService.getBySlug('thank-you').subscribe(page => {
      if (page?.title) this.pageTitle = page.title;
      if (page?.content) this.safeContent = this.sanitizer.bypassSecurityTrustHtml(page.content);
      this.cdr.markForCheck();
    });

    if (this.trackingToken) {
      this.orderService.track(this.trackingToken).subscribe(order => {
        this.pixel.trackPurchase(order.priceAtOrder);
      });
    }
  }
}
