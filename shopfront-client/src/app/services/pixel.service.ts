import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

declare function fbq(...args: unknown[]): void;

@Injectable({ providedIn: 'root' })
export class PixelService {

  constructor(private http: HttpClient) {}

  init() {}

  /** Generate a deduplication event ID. Pass the same ID to CAPI via the order payload. */
  genEventId(prefix: string): string {
    const uid = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now();
    return `${prefix}_${uid}`;
  }

  trackViewContent(productId: string, productTitle: string, price: number) {
    if (typeof fbq === 'undefined') return;
    const eventId = this.genEventId('vc');
    fbq('track', 'ViewContent', {
      content_ids:  [productId],
      content_name: productTitle,
      content_type: 'product',
      value:        price,
      currency:     'KES'
    }, { eventID: eventId });
    this.log('ViewContent', eventId, productId, price);
  }

  trackInitiateCheckout(value: number) {
    if (typeof fbq === 'undefined') return;
    const eventId = this.genEventId('ic');
    fbq('track', 'InitiateCheckout', { value, currency: 'KES' }, { eventID: eventId });
    this.log('InitiateCheckout', eventId, null, value);
  }

  /** eventId must match the leadEventId sent to the backend for CAPI deduplication. */
  trackLead(eventId: string) {
    if (typeof fbq === 'undefined') return;
    fbq('track', 'Lead', {}, { eventID: eventId });
    this.log('Lead', eventId, null, null);
  }

  /** eventId must match the purchaseEventId sent to the backend for CAPI deduplication. */
  trackPurchase(value: number, eventId: string) {
    if (typeof fbq === 'undefined') return;
    fbq('track', 'Purchase', { value, currency: 'KES' }, { eventID: eventId });
    this.log('Purchase', eventId, null, value);
  }

  trackContact() {
    if (typeof fbq === 'undefined') return;
    fbq('track', 'Contact');
    this.log('Contact', null, null, null);
  }

  private log(eventName: string, eventId: string | null, productId: string | null, value: number | null) {
    this.http.post(`${environment.apiUrl}/pixel-events`, { eventName, eventId, productId, value })
      .subscribe({ error: () => {} });
  }
}
