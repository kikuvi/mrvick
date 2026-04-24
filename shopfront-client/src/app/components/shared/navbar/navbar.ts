import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="container">
        <a routerLink="/" class="brand">{{ siteName }}</a>
        <ul class="nav-links">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a></li>
          <li><a routerLink="/about" routerLinkActive="active">About</a></li>
          <li><a routerLink="/contact" routerLinkActive="active">Contact</a></li>
        </ul>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  siteName = 'Shopfront';

  constructor(private settings: SettingsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.settings.getAll().subscribe(s => { this.siteName = s['site_name'] || 'Shopfront'; this.cdr.markForCheck(); });
  }
}
