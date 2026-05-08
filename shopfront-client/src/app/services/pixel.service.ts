import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

const PIXEL_ID = '1231226488729423';

declare function fbq(...args: unknown[]): void;

@Injectable({ providedIn: 'root' })
export class PixelService {
  private loaded = false;

  constructor(@Inject(DOCUMENT) private doc: Document) {}

  init() {
    if (this.loaded || this.doc.getElementById('fb-pixel-script')) return;
    this.loaded = true;

    // Base pixel script
    const script = this.doc.createElement('script');
    script.id = 'fb-pixel-script';
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window,document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    this.doc.head.appendChild(script);

    // Noscript fallback
    const noscript = this.doc.createElement('noscript');
    noscript.innerHTML = `<img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1" />`;
    this.doc.head.appendChild(noscript);
  }

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
