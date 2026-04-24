import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-section">
      <h1>Site Settings</h1>
      <div class="form-card">
        <form (ngSubmit)="save()">
          <label>Site Name
            <input type="text" [(ngModel)]="settings['site_name']" name="site_name" />
          </label>
          <label>Email
            <input type="email" [(ngModel)]="settings['site_email']" name="site_email" />
          </label>
          <label>Phone
            <input type="tel" [(ngModel)]="settings['site_phone']" name="site_phone" />
          </label>
          <label>Address
            <input type="text" [(ngModel)]="settings['site_address']" name="site_address" />
          </label>
          <label>Logo URL
            <input type="text" [(ngModel)]="settings['logo_url']" name="logo_url" />
          </label>
          <button type="submit" class="btn btn-primary">Save Settings</button>
          <span *ngIf="saved" class="success-msg">Settings saved!</span>
        </form>
      </div>
    </div>
  `
})
export class AdminSettingsComponent implements OnInit {
  settings: Record<string, string> = {};
  saved = false;

  constructor(private settingsService: SettingsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.settingsService.getAll().subscribe(s => { this.settings = s; this.cdr.markForCheck(); }); }

  save() {
    this.settingsService.update(this.settings).subscribe(() => {
      this.saved = true;
      this.cdr.markForCheck();
      setTimeout(() => { this.saved = false; this.cdr.markForCheck(); }, 3000);
    });
  }
}
