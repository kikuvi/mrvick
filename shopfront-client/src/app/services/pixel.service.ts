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

  /**
   * Returns the fbc value for CAPI user_data.
   *
   * Meta's recommended "parameter builder" approach: when fbclid is present in
   * the current URL, construct fbc directly from it — this is always tied to the
   * exact click that brought the user here and avoids stale or rewritten cookie values.
   * Only fall back to the _fbc cookie when no fbclid is in the URL.
   */
  getFbc(): string | undefined {
    if (typeof window !== 'undefined') {
      const fbclid = new URLSearchParams(window.location.search).get('fbclid');
      if (fbclid) return `fb.1.${Date.now()}.${fbclid}`;
    }
    return this.getCookie('_fbc');
  }

  /** Returns the _fbp browser ID cookie for CAPI user_data. */
  getFbp(): string | undefined {
    return this.getCookie('_fbp');
  }

  private getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : undefined;
  }

  private log(eventName: string, eventId: string | null, productId: string | null, value: number | null) {
    this.http.post(`${environment.apiUrl}/pixel-events`, { eventName, eventId, productId, value })
      .subscribe({ error: () => {} });
  }
}
