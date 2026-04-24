import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';
import { ProductService, Product } from '../../../services/product.service';
import { PageService } from '../../../services/page.service';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  styles: [`
    /* ---- Image carousel ---- */
    .card-img-wrap {
      display: block; overflow: hidden;
      height: 200px; position: relative;
    }
    .carousel-track {
      display: flex; height: 100%;
      transition: transform 0.5s ease;
      will-change: transform;
    }
    .carousel-track img {
      min-width: 100%; height: 200px;
      object-fit: cover; flex-shrink: 0;
    }
    .carousel-dots {
      position: absolute; bottom: 7px; left: 0; right: 0;
      display: flex; justify-content: center; gap: 5px;
      pointer-events: none;
    }
    .dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: rgba(255,255,255,.55);
      transition: background .3s, transform .3s;
    }
    .dot.active { background: #fff; transform: scale(1.25); }

    /* ---- Card body & Order Now button ---- */
    .product-card { display: flex; flex-direction: column; }
    .card-body { flex: 1; display: flex; flex-direction: column; padding: 1rem; }
    .card-body h3 { font-size: 1rem; margin-bottom: .5rem; color: #1a1a1a; }
    .card-body h3 a { color: inherit; }
    .card-body h3 a:hover { color: #e63946; }
    .card-spacer { flex: 1; }
    .order-btn {
      display: block; text-align: center; margin-top: .85rem;
      padding: .6rem 1rem; background: #e63946; color: #fff;
      border-radius: 6px; font-weight: 700; font-size: .9rem;
      transition: background .2s;
    }
    .order-btn:hover { background: #c1121f; color: #fff; }
  `],
  template: `
    <app-navbar />

    <section class="hero">
      <div class="container">
        <h1>{{ heroTitle }}</h1>
        <p>{{ heroSubtitle }}</p>
        <a href="#products" class="btn btn-primary">Shop Now</a>
      </div>
    </section>

    <section class="products-section" id="products" style="padding-bottom:1rem">
      <div class="container">
        <h2>Our Products</h2>
        <div class="products-grid">
          <div class="product-card" *ngFor="let p of products">

            <!-- Scrolling image carousel -->
            <a class="card-img-wrap" [routerLink]="['/products', p.id]">
              <div class="carousel-track"
                [style.transform]="'translateX(-' + (imgIdx[p.id] ?? 0) * 100 + '%)'">
                <img *ngFor="let url of (p.imageUrls.length ? p.imageUrls : [fallback])"
                  [src]="url" [alt]="p.title" />
              </div>
              <div class="carousel-dots" *ngIf="p.imageUrls.length > 1">
                <span *ngFor="let url of p.imageUrls; let i = index"
                  class="dot" [class.active]="(imgIdx[p.id] ?? 0) === i"></span>
              </div>
            </a>

            <!-- Card body -->
            <div class="card-body">
              <h3><a [routerLink]="['/products', p.id]">{{ p.title }}</a></h3>
              <div class="price">
                <span class="original">KES {{ p.price | number:'1.0-0' }}</span>
                <span class="discount">KES {{ p.discountPrice | number:'1.0-0' }}</span>
              </div>
              <div class="card-spacer"></div>
              <a class="order-btn" [routerLink]="['/products', p.id]">Order Now</a>
            </div>

          </div>
        </div>
        <p *ngIf="products.length === 0" class="empty">No products available yet.</p>
      </div>
    </section>

    <div *ngIf="safeContent" class="page-content container" style="padding-top:1rem" [innerHTML]="safeContent"></div>

    <app-footer />
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  heroTitle = 'Welcome to Shopfront';
  heroSubtitle = 'Quality products delivered to your door.';
  safeContent: SafeHtml = '';
  imgIdx: Record<string, number> = {};
  readonly fallback = 'assets/placeholder.jpg';

  private slideInterval?: ReturnType<typeof setInterval>;

  constructor(
    private productService: ProductService,
    private pageService: PageService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.productService.getAll().subscribe(p => {
      this.products = p;
      this.startCarousel();
      this.cdr.markForCheck();
    });
    this.pageService.getBySlug('home').subscribe(page => {
      if (page?.title) this.heroTitle = page.title;
      if (page?.metaDesc) this.heroSubtitle = page.metaDesc;
      if (page?.content) this.safeContent = this.sanitizer.bypassSecurityTrustHtml(page.content);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    clearInterval(this.slideInterval);
  }

  private startCarousel() {
    clearInterval(this.slideInterval);
    this.slideInterval = setInterval(() => {
      let changed = false;
      for (const p of this.products) {
        if (p.imageUrls.length > 1) {
          this.imgIdx[p.id] = ((this.imgIdx[p.id] ?? 0) + 1) % p.imageUrls.length;
          changed = true;
        }
      }
      if (changed) this.cdr.markForCheck();
    }, 3000);
  }
}
