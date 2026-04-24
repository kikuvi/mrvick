import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import { PageService, Page } from '../../../services/page.service';

@Component({
  selector: 'app-admin-pages',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillEditorComponent],
  styles: [`
    quill-editor { display: block; margin-bottom: 1rem; }
    ::ng-deep .ql-container { min-height: 200px; font-size: 1rem; }
    ::ng-deep .ql-editor { min-height: 200px; }
  `],
  template: `
    <div class="admin-section">
      <h1>Pages</h1>
      <div class="page-tabs">
        <button *ngFor="let s of slugs" (click)="load(s)"
                [class.active]="current?.slug === s" class="tab-btn">
          {{ s | titlecase }}
        </button>
      </div>

      <div class="form-card" *ngIf="current">
        <h2>Edit: {{ current.slug | titlecase }}</h2>
        <form (ngSubmit)="save()">
          <input type="text" placeholder="Page Title" [(ngModel)]="current.title" name="title" required />
          <input type="text" placeholder="Meta Description (SEO)" [(ngModel)]="current.metaDesc" name="metaDesc" />
          <label style="font-size:.85rem;color:#6b7280;margin-bottom:.25rem;display:block">Page Content</label>
          <quill-editor
            [(ngModel)]="current.content"
            name="content"
            [modules]="quillModules"
            placeholder="Write page content here...">
          </quill-editor>
          <button type="submit" class="btn btn-primary">Save Page</button>
          <span *ngIf="saved" class="success-msg">Saved!</span>
        </form>
      </div>
    </div>
  `
})
export class AdminPagesComponent implements OnInit {
  slugs = ['home', 'about', 'contact', 'thank-you'];
  current: Page | null = null;
  saved = false;

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: [1, 2, 3, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link'],
      ['clean']
    ]
  };

  constructor(private pageService: PageService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load('home'); }

  load(slug: string) {
    this.saved = false;
    this.pageService.getBySlug(slug).subscribe(p => { this.current = p; this.cdr.markForCheck(); });
  }

  save() {
    if (!this.current) return;
    this.pageService.update(this.current.slug, {
      title: this.current.title,
      content: this.current.content,
      metaDesc: this.current.metaDesc
    }).subscribe(() => {
      this.saved = true;
      this.cdr.markForCheck();
      setTimeout(() => { this.saved = false; this.cdr.markForCheck(); }, 3000);
    });
  }
}
