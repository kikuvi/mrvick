import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';
import { ProductService, Product } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';
import { PixelService } from '../../../services/pixel.service';
import { RatingService, Rating, SubmitRating } from '../../../services/rating.service';

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
    .lp-field-label input.ng-invalid.ng-touched,
    .lp-field-label select.ng-invalid.ng-touched,
    .lp-field-label textarea.ng-invalid.ng-touched { border-color: #e63946 !important; }
    .your-order { margin-bottom: 0.75rem; }
    .your-order-label { font-weight: 700; color: #1d3557; margin-bottom: 0.5rem; font-size: 1rem; }
    .variation-options { display: flex; flex-direction: row; flex-wrap: wrap; gap: 0.5rem; }
    .variation-option {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1rem; border: 2px solid #ddd; border-radius: 8px;
      cursor: pointer; transition: border-color .15s, background .15s;
      background: #fff;
    }
    .variation-option:hover { border-color: #1d3557; background: #f5f8ff; }
    .variation-option.selected { border-color: #1d3557; background: #eef3ff; }
    /* Hide native radio — the label click still drives ngModel */
    .variation-option input[type="radio"] { position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none; }
    /* Custom radio dot */
    .radio-dot {
      width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
      border: 2px solid #bbb; background: #fff;
      transition: border-color .15s, background .15s, box-shadow .15s;
    }
    .variation-option.selected .radio-dot {
      border-color: #1d3557; background: #1d3557;
      box-shadow: inset 0 0 0 4px #fff;
    }
    .variation-option span { font-size: 0.95rem; color: #1a1a1a; }
    .variation-options.invalid { border: 2px solid #e63946; border-radius: 10px; padding: 0.4rem; }
    .field-error { font-size: 0.8rem; font-weight: 400; color: #e63946; margin-top: -0.1rem; }
    .rating-section { background: #f9fafb; padding: 2rem 1rem; }
    .rating-section h3 { text-align: center; font-size: 1.1rem; color: #1a1a1a; margin-bottom: 1.25rem; }
    .rating-form { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 10px; padding: 1.25rem 1.4rem; box-shadow: 0 2px 8px rgba(0,0,0,.07); display: flex; flex-direction: column; gap: 0.85rem; }
    .star-row { display: flex; gap: 0.3rem; }
    .star-btn { background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #d1d5db; transition: color .1s; line-height: 1; padding: 0; }
    .star-btn.filled { color: #f59e0b; }
    .rating-input { padding: 0.6rem 0.8rem; border: 1.5px solid #d1d5db; border-radius: 7px; font-size: .9rem; width: 100%; box-sizing: border-box; }
    .rating-input:focus { outline: none; border-color: #1d3557; }
    .rating-submit { background: #1d3557; color: #fff; border: none; border-radius: 7px; padding: .65rem 1.5rem; font-size: .95rem; font-weight: 600; cursor: pointer; transition: background .15s; }
    .rating-submit:hover { background: #16304f; }
    .rating-submit:disabled { opacity: .6; cursor: not-allowed; }
    .rating-success { text-align: center; color: #16a34a; font-size: .9rem; font-weight: 600; }
    .reviews-section { background: #fff; padding: 2.5rem 1rem; }
    .reviews-section h3 { text-align: center; font-size: 1.3rem; color: #1a1a1a; margin-bottom: 1.5rem; }
    .reviews-carousel { max-width: 560px; margin: 0 auto; }
    .reviews-track-wrap { overflow: hidden; }
    .reviews-track { display: flex; transition: transform .18s ease; }
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
          <form (ngSubmit)="placeOrder()" #orderForm="ngForm">
            <label class="lp-field-label">Full Name
              <input type="text" placeholder="e.g. John Doe" [(ngModel)]="order.customerName" name="customerName" required #nameField="ngModel" />
              <span class="field-error" *ngIf="nameField.invalid && nameField.touched">Full name is required</span>
            </label>
            <label class="lp-field-label">Phone Number
              <input type="tel" placeholder="e.g. 0712345678" [(ngModel)]="order.phone" name="phone" required pattern="[0-9]{10}|[0-9]{12}" #phoneField="ngModel" />
              <span class="field-error" *ngIf="phoneField.invalid && phoneField.touched">
                {{ phoneField.errors?.['required'] ? 'Phone number is required' : 'Enter a valid 10 or 12-digit phone number' }}
              </span>
            </label>
            <label class="lp-field-label">Email
              <input type="email" placeholder="e.g. john@email.com" [(ngModel)]="order.email" name="email" required email #emailField="ngModel" />
              <span class="field-error" *ngIf="emailField.invalid && emailField.touched">
                {{ emailField.errors?.['required'] ? 'Email is required' : 'Enter a valid email address' }}
              </span>
            </label>

            <!-- Your Order — shown only when the product has variations -->
            <div class="your-order" *ngIf="product.variations?.length">
              <p class="your-order-label">Your Order</p>
              <div class="variation-options"
                [class.invalid]="orderForm.controls['variation']?.invalid && orderForm.controls['variation']?.touched">
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
                  <span class="radio-dot"></span>
                  <span>{{ v.label }} — Ksh{{ product.discountPrice | number:'1.0-0' }}</span>
                </label>
              </div>
              <span class="field-error" *ngIf="orderForm.controls['variation']?.invalid && orderForm.controls['variation']?.touched">
                Please select a variation
              </span>
            </div>

            <label class="lp-field-label">Delivery County
              <select [(ngModel)]="order.county" name="county" required #countyField="ngModel">
                <option value="">Select county</option>
                <option *ngFor="let c of counties" [value]="c">{{ c }}</option>
              </select>
              <span class="field-error" *ngIf="countyField.invalid && countyField.touched">Please select a county</span>
            </label>
            <label class="lp-field-label">Delivery Address
              <textarea placeholder="e.g. Tom Mboya Street, near KFC" [(ngModel)]="order.deliveryAddress" name="deliveryAddress" rows="3" required #addressField="ngModel"></textarea>
              <span class="field-error" *ngIf="addressField.invalid && addressField.touched">Delivery address is required</span>
            </label>
            <button type="submit" class="lp-order-btn" [disabled]="submitting">
              {{ submitting ? 'Placing Order...' : 'Order Now — KES ' + (product.discountPrice | number:'1.0-0') }}
            </button>
          </form>
        </div>

      </div>

      <!-- Rate this product -->
      <div class="rating-section" *ngIf="product.ratingsEnabled">
        <h3>Leave a Review</h3>
        <div class="rating-form" *ngIf="!ratingSubmitted">
          <div class="star-row">
            <button type="button" class="star-btn" *ngFor="let s of [1,2,3,4,5]"
              [class.filled]="s <= (ratingHover || ratingForm.rating)"
              (mouseenter)="ratingHover = s" (mouseleave)="ratingHover = 0"
              (click)="ratingForm.rating = s">★</button>
          </div>
          <input class="rating-input" type="text" placeholder="Your name" [(ngModel)]="ratingForm.customerName" name="rName" />
          <textarea class="rating-input" rows="3" placeholder="Share your experience..." [(ngModel)]="ratingForm.comment" name="rComment"></textarea>
          <button class="rating-submit" [disabled]="ratingSubmitting || !ratingForm.rating || !ratingForm.customerName" (click)="submitRating()">
            {{ ratingSubmitting ? 'Submitting...' : 'Submit Review' }}
          </button>
        </div>
        <p class="rating-success" *ngIf="ratingSubmitted">✔ Thank you! Your review will appear after approval.</p>
      </div>

      <!-- Customer Reviews Carousel -->
      <div class="reviews-section">
        <h3>⭐ What Our Customers Say</h3>
        <div class="reviews-carousel">
          <div class="reviews-track-wrap">
            <div class="reviews-track" [style.transform]="'translateX(-' + reviewIndex * 100 + '%)'">
              <div class="review-card" *ngFor="let r of displayReviews">
                <div class="review-top">
                  <span class="review-name">{{ r.customerName }}</span>
                  <span class="review-badge">✔ Verified Buyer</span>
                </div>
                <div class="review-stars">{{ starsFor(r.rating) }}</div>
                <p class="review-text">{{ r.comment }}</p>
                <p class="review-date">{{ r.createdAt | date:'mediumDate' }}</p>
              </div>
            </div>
          </div>
          <div class="reviews-controls" *ngIf="displayReviews.length > 1">
            <button class="reviews-arrow" (click)="prevReview()">&#8592;</button>
            <div class="reviews-dots">
              <div *ngFor="let r of displayReviews; let i = index"
                   class="reviews-dot" [class.active]="i === reviewIndex"
                   (click)="reviewIndex = i; resetTimer()"></div>
            </div>
            <button class="reviews-arrow" (click)="nextReview()">&#8594;</button>
          </div>
        </div>
      </div>

    </div>

    <app-footer />
  `
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  @ViewChild('orderForm') orderForm!: NgForm;

  product: Product | null = null;
  safeDesc: SafeHtml = '';
  loading = true;
  submitting = false;
  counties = KENYA_COUNTIES;
  selectedVariation = '';

  order = { customerName: '', phone: '', email: '', county: '', deliveryAddress: '' };

  // Ratings
  carouselReviews: Rating[] = [];

  private readonly fallbackReviews: Rating[] = [
    { id:'1', customerName:'Grace Wanjiku',  rating:5, comment:'Received my order the same day I placed it. The product is exactly as described and the quality is great. Will definitely order again!', isApproved:true, createdAt:'2026-04-25T00:00:00Z', productId:'', productTitle:'' },
    { id:'2', customerName:'Brian Otieno',   rating:5, comment:'Pay on delivery is the best — I was nervous ordering online but everything went smoothly. The rider was polite and on time.', isApproved:true, createdAt:'2026-04-10T00:00:00Z', productId:'', productTitle:'' },
    { id:'3', customerName:'Fatuma Abdi',    rating:5, comment:'Fast delivery to Mombasa, I was not expecting it so quickly. Packaging was neat and the item was in perfect condition.', isApproved:true, createdAt:'2026-04-18T00:00:00Z', productId:'', productTitle:'' },
    { id:'4', customerName:'James Kamau',    rating:4, comment:'Good product and fair price. Delivery took one day to Nakuru which is acceptable. Customer service was responsive when I called.', isApproved:true, createdAt:'2026-04-08T00:00:00Z', productId:'', productTitle:'' },
    { id:'5', customerName:'Mercy Chebet',   rating:5, comment:'Ordered for the second time now. Shopfront never disappoints — genuine products and the free delivery is a big plus for me.', isApproved:true, createdAt:'2026-03-20T00:00:00Z', productId:'', productTitle:'' },
  ];

  get displayReviews(): Rating[] {
    return [...this.carouselReviews, ...this.fallbackReviews];
  }
  ratingForm: SubmitRating = { customerName: '', rating: 0, comment: '' };
  ratingHover = 0;
  ratingSubmitting = false;
  ratingSubmitted = false;

  // Carousel
  reviewIndex = 0;
  private reviewTimer: ReturnType<typeof setInterval> | null = null;

  starsFor(n: number): string { return '★'.repeat(n) + '☆'.repeat(5 - n); }

  prevReview() { this.reviewIndex = this.reviewIndex === 0 ? this.displayReviews.length - 1 : this.reviewIndex - 1; this.resetTimer(); }
  nextReview() { this.reviewIndex = this.reviewIndex === this.displayReviews.length - 1 ? 0 : this.reviewIndex + 1; this.resetTimer(); }

  startTimer() {
    if (this.displayReviews.length <= 1) return;
    this.reviewTimer = setInterval(() => {
      this.reviewIndex = this.reviewIndex === this.displayReviews.length - 1 ? 0 : this.reviewIndex + 1;
      this.cdr.markForCheck();
    }, 3000);
  }

  resetTimer() {
    if (this.reviewTimer) clearInterval(this.reviewTimer);
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.reviewTimer) clearInterval(this.reviewTimer);
  }

  submitRating() {
    if (!this.product || !this.ratingForm.rating || !this.ratingForm.customerName) return;
    this.ratingSubmitting = true;
    this.ratingService.submit(this.product.id, this.ratingForm).subscribe({
      next: () => { this.ratingSubmitting = false; this.ratingSubmitted = true; this.cdr.markForCheck(); },
      error: () => { this.ratingSubmitting = false; this.cdr.markForCheck(); }
    });
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private orderService: OrderService,
    private ratingService: RatingService,
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
        this.ratingService.getAll(true).subscribe(ratings => {
          this.carouselReviews = ratings;
          this.startTimer();
          this.cdr.markForCheck();
        });
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
    this.orderForm.form.markAllAsTouched();
    this.cdr.markForCheck();
    if (!this.orderForm.valid) return;
    this.submitting = true;

    // Generate IDs once — same ID goes to both pixel and CAPI for deduplication
    const leadEventId     = this.pixel.genEventId('lead');
    const purchaseEventId = this.pixel.genEventId('purchase');

    this.pixel.trackInitiateCheckout(this.product.discountPrice || this.product.price);
    this.pixel.trackLead(leadEventId);

    this.orderService.place({
      ...this.order,
      productId: this.product.id,
      productTitle: this.product.title,
      variation: this.selectedVariation || undefined,
      leadEventId,
      purchaseEventId,
      eventSourceUrl: window.location.href,
      fbp: this.getCookie('_fbp'),
      fbc: this.getCookie('_fbc')
    }).subscribe({
      next: res => {
        this.submitting = false;
        this.router.navigate(['/order-confirmed', res.trackingToken], {
          queryParams: { name: this.order.customerName, peid: purchaseEventId }
        });
      },
      error: () => { this.submitting = false; this.cdr.markForCheck(); }
    });
  }

  private getCookie(name: string): string | undefined {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : undefined;
  }
}
