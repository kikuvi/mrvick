import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';
import { ProductService, Product } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';

const KENYA_COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa','Homa Bay',
  'Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi','Kirinyaga','Kisii',
  'Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos','Makueni','Mandera',
  'Marsabit','Meru','Migori','Mombasa','Murang\'a','Nairobi','Nakuru','Nandi',
  'Narok','Nyamira','Nyandarua','Nyeri','Samburu','Siaya','Taita-Taveta','Tana River',
  'Tharaka-Nithi','Trans Nzoia','Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot'
];

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar />

    <div class="lp-loading" *ngIf="loading">Loading...</div>
    <div class="lp-error" *ngIf="!loading && !product">Product not found.</div>

    <div class="lp" *ngIf="product">

      <!-- Headline + Description -->
      <div class="lp-hero">
        <div class="lp-container">
          <h1 class="lp-title">{{ product.title }}</h1>
          <div class="lp-desc" [innerHTML]="safeDesc"></div>
          <div class="lp-price-row">
            <span class="lp-old-price">KES {{ product.price | number:'1.0-0' }}</span>
            <span class="lp-new-price">KES {{ product.discountPrice | number:'1.0-0' }}</span>
            <span class="lp-free-delivery">+ FREE DELIVERY</span>
          </div>
        </div>
      </div>

      <!-- All images stacked -->
      <div class="lp-images">
        <img *ngFor="let img of product.imageUrls" [src]="img" [alt]="product.title" />
      </div>

      <!-- Trust badges -->
      <div class="lp-trust">
        <div class="lp-container lp-trust-grid">
          <div class="lp-badge">
            <span class="lp-badge-icon">✅</span>
            <div>
              <strong>14-Day Returns</strong>
              <p>Not satisfied? Return within 14 days.</p>
            </div>
          </div>
          <div class="lp-badge">
            <span class="lp-badge-icon">🚚</span>
            <div>
              <strong>Free Delivery</strong>
              <p>Delivered to your door, no extra cost.</p>
            </div>
          </div>
          <div class="lp-badge">
            <span class="lp-badge-icon">💳</span>
            <div>
              <strong>Pay on Delivery</strong>
              <p>Pay only when your order arrives.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery info -->
      <div class="lp-delivery">
        <div class="lp-container">
          <h3>Delivery Information</h3>
          <ul>
            <li>⚡ <strong>Same-day delivery</strong> within Nairobi, Kiambu, Machakos &amp; Kajiado</li>
            <li>📦 <strong>Next-day delivery</strong> to all other counties nationwide</li>
          </ul>
        </div>
      </div>

      <!-- Order form -->
      <div class="lp-container lp-order-wrap">
        <div class="lp-order" *ngIf="!orderPlaced">
          <h2>Place Your Order</h2>
          <p class="lp-order-sub">Fill in your details below and we'll deliver to you.</p>
          <form (ngSubmit)="placeOrder()" #f="ngForm">
            <input type="text"  placeholder="Full Name"        [(ngModel)]="order.customerName"   name="customerName"   required />
            <input type="tel"   placeholder="Phone Number"     [(ngModel)]="order.phone"           name="phone"          required />
            <input type="email" placeholder="Email (optional)" [(ngModel)]="order.email"           name="email" />
            <select [(ngModel)]="order.county" name="county" required>
              <option value="">Select Delivery County</option>
              <option *ngFor="let c of counties" [value]="c">{{ c }}</option>
            </select>
            <textarea placeholder="Delivery Address / Landmark" [(ngModel)]="order.deliveryAddress" name="deliveryAddress" rows="3" required></textarea>
            <button type="submit" class="lp-order-btn" [disabled]="submitting">
              {{ submitting ? 'Placing Order...' : 'Order Now — KES ' + (product.discountPrice | number:'1.0-0') }}
            </button>
          </form>
        </div>

        <div class="lp-success" *ngIf="orderPlaced">
          <div class="lp-success-icon">🎉</div>
          <h2>Order Placed!</h2>
          <p>Thank you, {{ order.customerName }}! We'll deliver soon.</p>
          <p>Your tracking code:</p>
          <div class="lp-token">{{ trackingToken }}</div>
          <a [routerLink]="['/track', trackingToken]" class="lp-order-btn" style="display:inline-block;text-align:center;margin-top:1rem">Track Your Order</a>
        </div>
      </div>

    </div>

    <app-footer />
  `
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  safeDesc: SafeHtml = '';
  activeImage = '';
  loading = true;
  submitting = false;
  orderPlaced = false;
  trackingToken = '';
  counties = KENYA_COUNTIES;

  order = { customerName: '', phone: '', email: '', county: '', deliveryAddress: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private orderService: OrderService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe({
      next: p => {
        this.product = p;
        this.safeDesc = this.sanitizer.bypassSecurityTrustHtml(p.description);
        this.activeImage = p.imageUrls[0] || '';
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  placeOrder() {
    if (!this.product) return;
    this.submitting = true;
    this.orderService.place({ ...this.order, productId: this.product.id }).subscribe({
      next: res => { this.trackingToken = res.trackingToken; this.orderPlaced = true; this.submitting = false; this.cdr.markForCheck(); },
      error: () => { this.submitting = false; this.cdr.markForCheck(); }
    });
  }
}
