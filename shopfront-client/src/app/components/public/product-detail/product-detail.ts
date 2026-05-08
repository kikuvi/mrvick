import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';
import { ProductService, Product } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';
import { PixelService } from '../../../services/pixel.service';

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
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  styles: [`
    .lp-field-label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.9rem; font-weight: 700; color: #1a1a1a; }
    .lp-field-label input, .lp-field-label select, .lp-field-label textarea {
      font-weight: 400; border: 2px solid #1d3557 !important; border-radius: 8px;
    }
    .lp-field-label input:focus, .lp-field-label select:focus, .lp-field-label textarea:focus {
      outline: none; border-color: #e63946 !important; box-shadow: 0 0 0 3px rgba(230,57,70,.15);
    }
    .your-order { margin-bottom: 0.75rem; }
    .your-order-label { font-weight: 700; color: #1d3557; margin-bottom: 0.5rem; font-size: 1rem; }
    .variation-options { display: flex; flex-direction: row; flex-wrap: wrap; gap: 0.5rem; }
    .variation-option {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1rem; border: 2px solid #ddd; border-radius: 8px;
      cursor: pointer; transition: border-color .15s, background .15s;
    }
    .variation-option:hover { border-color: #1d3557; background: #f5f8ff; }
    .variation-option.selected { border-color: #1d3557; background: #eef3ff; }
    .variation-option input[type="radio"] { accent-color: #1d3557; width: 16px; height: 16px; flex-shrink: 0; }
    .variation-option span { font-size: 0.95rem; color: #1a1a1a; }
    .reviews-section { background: #f9fafb; padding: 2.5rem 1rem; }
    .reviews-section h3 { text-align: center; font-size: 1.3rem; color: #1a1a1a; margin-bottom: 1.5rem; }
    .reviews-carousel { max-width: 560px; margin: 0 auto; }
    .reviews-track-wrap { overflow: hidden; }
    .reviews-track { display: flex; transition: transform .35s ease; }
    .review-card { min-width: 100%; background: #fff; border-radius: 10px; padding: 1.25rem 1.4rem; box-shadow: 0 2px 8px rgba(0,0,0,.07); box-sizing: border-box; }
    .review-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; }
    .review-name { font-weight: 700; font-size: 0.95rem; color: #1a1a1a; }
    .review-badge { font-size: 0.72rem; background: #dcfce7; color: #16a34a; border-radius: 99px; padding: 0.15rem 0.6rem; font-weight: 600; }
    .review-stars { color: #f59e0b; font-size: 1rem; margin-bottom: 0.4rem; }
    .review-text { font-size: 0.9rem; color: #4b5563; line-height: 1.5; }
    .review-date { font-size: 0.75rem; color: #9ca3af; margin-top: 0.4rem; }
    .reviews-controls { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1rem; }
    .reviews-arrow { background: #fff; border: 2px solid #e5e7eb; border-radius: 50%; width: 36px; height: 36px; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: border-color .15s; }
    .reviews-arrow:hover { border-color: #1d3557; }
    .reviews-dots { display: flex; gap: 6px; }
    .reviews-dot { width: 8px; height: 8px; border-radius: 50%; background: #d1d5db; cursor: pointer; transition: background .2s; }
    .reviews-dot.active { background: #1d3557; }
  `],
  template: `
    <app-navbar />

    <div class="lp-loading" *ngIf="loading">Loading...</div>
    <div class="lp-error" *ngIf="!loading && !product">Product not found.</div>

    <div class="lp" *ngIf="product">

      <!-- Headline + Description -->
      <div class="lp-hero">
        <div class="lp-container">
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
        <div class="lp-order">
          <h2>Fill out the form to place your order</h2>
          <form (ngSubmit)="placeOrder()" #f="ngForm">
            <label class="lp-field-label">Full Name
              <input type="text" placeholder="e.g. John Doe" [(ngModel)]="order.customerName" name="customerName" required />
            </label>
            <label class="lp-field-label">Phone Number
              <input type="tel" placeholder="e.g. 0712345678" [(ngModel)]="order.phone" name="phone" required />
            </label>
            <label class="lp-field-label">Email <span style="font-weight:400;font-size:.85rem;color:#888">(optional)</span>
              <input type="email" placeholder="e.g. john@email.com" [(ngModel)]="order.email" name="email" />
            </label>

            <!-- Your Order — shown only when the product has variations -->
            <div class="your-order" *ngIf="product.variations?.length">
              <p class="your-order-label">Your Order</p>
              <div class="variation-options">
                <label
                  *ngFor="let v of product.variations"
                  class="variation-option"
                  [class.selected]="selectedVariation === v.label">
                  <input
                    type="radio"
                    [value]="v.label"
                    [(ngModel)]="selectedVariation"
                    name="variation"
                    required />
                  <span>{{ v.label }} — Ksh{{ product.discountPrice | number:'1.0-0' }}</span>
                </label>
              </div>
            </div>

            <label class="lp-field-label">Delivery County
              <select [(ngModel)]="order.county" name="county" required>
                <option value="">Select county</option>
                <option *ngFor="let c of counties" [value]="c">{{ c }}</option>
              </select>
            </label>
            <label class="lp-field-label">Delivery Address
              <textarea placeholder="e.g. Tom Mboya Street, near KFC" [(ngModel)]="order.deliveryAddress" name="deliveryAddress" rows="3" required></textarea>
            </label>
            <button type="submit" class="lp-order-btn" [disabled]="submitting">
              {{ submitting ? 'Placing Order...' : 'Order Now — KES ' + (product.discountPrice | number:'1.0-0') }}
            </button>
          </form>
        </div>

      </div>

      <!-- Customer Reviews Carousel -->
      <div class="reviews-section">
        <h3>⭐ What Our Customers Say</h3>
        <div class="reviews-carousel">
          <div class="reviews-track-wrap">
            <div class="reviews-track" [style.transform]="'translateX(-' + reviewIndex * 100 + '%)'">
              <div class="review-card">
                <div class="review-top">
                  <span class="review-name">Grace Wanjiku</span>
                  <span class="review-badge">✔ Verified Buyer</span>
                </div>
                <div class="review-stars">★★★★★</div>
                <p class="review-text">Received my order the same day I placed it. The product is exactly as described and the quality is great. Will definitely order again!</p>
                <p class="review-date">2 weeks ago</p>
              </div>
              <div class="review-card">
                <div class="review-top">
                  <span class="review-name">Brian Otieno</span>
                  <span class="review-badge">✔ Verified Buyer</span>
                </div>
                <div class="review-stars">★★★★★</div>
                <p class="review-text">Pay on delivery is the best — I was nervous ordering online but everything went smoothly. The rider was polite and on time.</p>
                <p class="review-date">1 month ago</p>
              </div>
              <div class="review-card">
                <div class="review-top">
                  <span class="review-name">Fatuma Abdi</span>
                  <span class="review-badge">✔ Verified Buyer</span>
                </div>
                <div class="review-stars">★★★★★</div>
                <p class="review-text">Fast delivery to Mombasa, I was not expecting it so quickly. Packaging was neat and the item was in perfect condition.</p>
                <p class="review-date">3 weeks ago</p>
              </div>
              <div class="review-card">
                <div class="review-top">
                  <span class="review-name">James Kamau</span>
                  <span class="review-badge">✔ Verified Buyer</span>
                </div>
                <div class="review-stars">★★★★☆</div>
                <p class="review-text">Good product and fair price. Delivery took one day to Nakuru which is acceptable. Customer service was responsive when I called.</p>
                <p class="review-date">1 month ago</p>
              </div>
              <div class="review-card">
                <div class="review-top">
                  <span class="review-name">Mercy Chebet</span>
                  <span class="review-badge">✔ Verified Buyer</span>
                </div>
                <div class="review-stars">★★★★★</div>
                <p class="review-text">Ordered for the second time now. Shopfront never disappoints — genuine products and the free delivery is a big plus for me.</p>
                <p class="review-date">2 months ago</p>
              </div>
            </div>
          </div>
          <div class="reviews-controls">
            <button class="reviews-arrow" (click)="prevReview()">&#8592;</button>
            <div class="reviews-dots">
              <div *ngFor="let r of reviews; let i = index"
                   class="reviews-dot" [class.active]="i === reviewIndex"
                   (click)="reviewIndex = i"></div>
            </div>
            <button class="reviews-arrow" (click)="nextReview()">&#8594;</button>
          </div>
        </div>
      </div>

    </div>

    <app-footer />
  `
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  safeDesc: SafeHtml = '';
  loading = true;
  submitting = false;
  counties = KENYA_COUNTIES;
  selectedVariation = '';

  order = { customerName: '', phone: '', email: '', county: '', deliveryAddress: '' };

  reviews = [0, 1, 2, 3, 4];
  reviewIndex = 0;

  prevReview() { this.reviewIndex = this.reviewIndex === 0 ? this.reviews.length - 1 : this.reviewIndex - 1; }
  nextReview() { this.reviewIndex = this.reviewIndex === this.reviews.length - 1 ? 0 : this.reviewIndex + 1; }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private orderService: OrderService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private pixel: PixelService
  ) {}

  ngOnInit() {
    this.pixel.init();
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productService.getById(id).subscribe({
      next: p => {
        this.product = p;
        this.safeDesc = this.sanitizer.bypassSecurityTrustHtml(p.description);
        this.loading = false;
        this.pixel.trackViewContent(p.id, p.title, p.discountPrice || p.price);
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
    this.pixel.trackInitiateCheckout(this.product.discountPrice || this.product.price);
    this.pixel.trackLead();
    this.orderService.place({
      ...this.order,
      productId: this.product.id,
      productTitle: this.product.title,
      variation: this.selectedVariation || undefined
    }).subscribe({
      next: res => {
        this.submitting = false;
        this.router.navigate(['/order-confirmed', res.trackingToken], { queryParams: { name: this.order.customerName } });
      },
      error: () => { this.submitting = false; this.cdr.markForCheck(); }
    });
  }
}
