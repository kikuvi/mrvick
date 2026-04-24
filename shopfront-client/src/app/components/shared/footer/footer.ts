import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <h3>{{ settings['site_name'] || 'Shopfront' }}</h3>
            <p>{{ settings['site_address'] }}</p>
          </div>
          <div>
            <h4>Contact</h4>
            <p>{{ settings['site_phone'] }}</p>
            <p>{{ settings['site_email'] }}</p>
          </div>
        </div>
        <p class="copyright">&copy; {{ year }} {{ settings['site_name'] || 'Shopfront' }}. All rights reserved.</p>
      </div>
    </footer>
  `
})
export class FooterComponent implements OnInit {
  settings: Record<string, string> = {};
  year = new Date().getFullYear();

  constructor(private settingsService: SettingsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.settingsService.getAll().subscribe(s => { this.settings = s; this.cdr.markForCheck(); });
  }
}
