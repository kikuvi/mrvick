import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';
import { PageService } from '../../../services/page.service';
import { SettingsService } from '../../../services/settings.service';
import { PixelService } from '../../../services/pixel.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar />
    <div class="page-content container">

      <div *ngIf="safeIntro" [innerHTML]="safeIntro"></div>

      <div class="contact-grid">
        <div class="contact-info">
          <h3>Contact Details</h3>
          <p><strong>Phone:</strong> {{ settings['site_phone'] }}</p>
          <p><strong>Email:</strong> {{ settings['site_email'] }}</p>
          <p><strong>Address:</strong> {{ settings['site_address'] }}</p>
        </div>
        <div class="contact-form">
          <h3>Send a Message</h3>
          <form (ngSubmit)="send()" #f="ngForm">
            <input type="text" placeholder="Your Name" [(ngModel)]="form.name" name="name" required />
            <input type="email" placeholder="Your Email" [(ngModel)]="form.email" name="email" required />
            <textarea placeholder="Your Message" [(ngModel)]="form.message" name="message" rows="5" required></textarea>
            <button type="submit" class="btn btn-primary">Send Message</button>
          </form>
          <p *ngIf="sent" class="success">Message sent! We'll get back to you soon.</p>
        </div>
      </div>
    </div>
    <app-footer />
  `
})
export class ContactComponent implements OnInit {
  settings: Record<string, string> = {};
  safeIntro: SafeHtml = '';
  form = { name: '', email: '', message: '' };
  sent = false;

  constructor(
    private pageService: PageService,
    private settingsService: SettingsService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private pixel: PixelService
  ) {}

  ngOnInit() {
    this.pixel.trackContact();
    this.settingsService.getAll().subscribe(s => { this.settings = s; this.cdr.markForCheck(); });
    this.pageService.getBySlug('contact').subscribe(page => {
      if (page?.content) {
        this.safeIntro = this.sanitizer.bypassSecurityTrustHtml(page.content);
      }
      this.cdr.markForCheck();
    });
  }

  send() {
    this.sent = true;
    this.form = { name: '', email: '', message: '' };
    this.cdr.markForCheck();
  }
}
