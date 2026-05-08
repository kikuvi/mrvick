import { Injectable } from '@angular/core';

declare function fbq(...args: unknown[]): void;

@Injectable({ providedIn: 'root' })
export class PixelService {

  // Base pixel is in index.html — no dynamic injection needed
  init() {}

  trackViewContent(productId: string, productTitle: string, price: number) {
    if (typeof fbq === 'undefined') return;
    fbq('track', 'ViewContent', {
      content_ids:  [productId],
      content_name: productTitle,
      content_type: 'product',
      value:        price,
      currency:     'KES'
    });
  }

  trackPurchase(value: number) {
    if (typeof fbq === 'undefined') return;
    fbq('track', 'Purchase', {
      value:    value,
      currency: 'KES'
    });
  }
}
