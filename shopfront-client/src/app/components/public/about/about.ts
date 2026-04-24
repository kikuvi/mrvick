import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';
import { PageService } from '../../../services/page.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar />
    <div class="page-content container">
      <div [innerHTML]="safeContent"></div>
    </div>
    <app-footer />
  `
})
export class AboutComponent implements OnInit {
  safeContent: SafeHtml = '';

  constructor(private pageService: PageService, private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.pageService.getBySlug('about').subscribe(page => {
      if (page?.content) this.safeContent = this.sanitizer.bypassSecurityTrustHtml(page.content);
      this.cdr.markForCheck();
    });
  }
}
