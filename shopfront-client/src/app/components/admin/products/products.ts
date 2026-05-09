import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RichEditorComponent } from '../rich-editor/rich-editor';
import { ProductService, Product, CreateProduct } from '../../../services/product.service';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, RichEditorComponent],
  styles: [`
    /* ---- Modal overlay ---- */
    .editor-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      display: flex; align-items: flex-start; justify-content: center;
      z-index: 200; padding: 2rem 1rem; overflow-y: auto;
    }
    .editor-modal {
      background: #fff; border-radius: 12px; width: 100%; max-width: 960px;
      box-shadow: 0 12px 48px rgba(0,0,0,.25); margin: auto;
    }
    .editor-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.25rem 1.5rem; border-bottom: 1px solid #eee;
    }
    .editor-header h2 { margin: 0; font-size: 1.2rem; color: #1d3557; }
    .close-btn {
      width: 32px; height: 32px; border-radius: 50%; border: none;
      background: #f0f0f0; cursor: pointer; font-size: 1.2rem; line-height: 1;
      display: flex; align-items: center; justify-content: center; color: #555;
    }
    .close-btn:hover { background: #e0e0e0; }

    /* ---- Two-column body ---- */
    .editor-body { display: grid; grid-template-columns: 1fr 300px; }
    .editor-form {
      padding: 1.5rem; border-right: 1px solid #eee;
      display: flex; flex-direction: column; gap: 1.25rem; overflow-y: auto;
    }
    .editor-preview { padding: 1.5rem; background: #f8f9fa; }

    /* ---- Form fields ---- */
    .field-group { display: flex; flex-direction: column; gap: 0.3rem; }
    .field-label { font-size: .82rem; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: .4px; }
    .field-group input {
      padding: 0.7rem 0.9rem; border: 1px solid #ddd; border-radius: 6px;
      font-size: .95rem; transition: border-color .2s, box-shadow .2s;
    }
    .field-group input:focus {
      outline: none; border-color: #1d3557; box-shadow: 0 0 0 3px rgba(29,53,87,.1);
    }

    /* ---- Pricing ---- */
    .price-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .price-input-wrap { position: relative; }
    .price-prefix {
      position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%);
      font-size: .85rem; color: #888; font-weight: 600; pointer-events: none;
    }
    .price-input-wrap input { padding-left: 2.5rem; }
    .savings-badge {
      margin-top: 0.5rem; display: inline-flex; align-items: center; gap: 0.4rem;
      background: #d4edda; color: #155724; font-size: .8rem; font-weight: 700;
      padding: 0.25rem 0.75rem; border-radius: 20px;
    }

    /* ---- Images ---- */
    .img-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .img-row { display: grid; grid-template-columns: 52px 1fr 32px; gap: 0.5rem; align-items: center; }
    .img-thumb {
      width: 52px; height: 52px; border-radius: 6px; object-fit: cover;
      border: 1px solid #ddd; background: #f0f0f0; display: block;
    }
    .img-thumb-placeholder {
      width: 52px; height: 52px; border-radius: 6px; border: 1px dashed #ccc;
      background: #f9f9f9; display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem; color: #ccc;
    }
    .img-row input {
      padding: 0.5rem 0.75rem; border: 1px solid #ddd; border-radius: 6px;
      font-size: .88rem; width: 100%;
    }
    .img-row input:focus { outline: none; border-color: #1d3557; }
    .img-row { grid-template-columns: 52px 1fr 32px 32px; }
    .upload-btn {
      width: 32px; height: 32px; border: none; background: #e0eaff; color: #1d3557;
      border-radius: 6px; cursor: pointer; font-size: .9rem; line-height: 1;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .upload-btn:hover { background: #c7d9ff; }
    .upload-btn:disabled { opacity: .5; cursor: not-allowed; }
    .remove-img {
      width: 32px; height: 32px; border: none; background: #fee2e2; color: #dc2626;
      border-radius: 6px; cursor: pointer; font-size: 1rem; line-height: 1;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .remove-img:hover { background: #fecaca; }
    .add-img-btn {
      margin-top: 0.5rem; padding: 0.55rem 1rem; border: 1px dashed #1d3557;
      background: transparent; color: #1d3557; border-radius: 6px; cursor: pointer;
      font-size: .88rem; font-weight: 600; width: 100%; transition: background .15s;
    }
    .add-img-btn:hover { background: #eef2ff; }

    /* ---- Variations ---- */
    .variation-list { display: flex; flex-direction: column; gap: 0.4rem; }
    .variation-row { display: grid; grid-template-columns: 1fr 32px; gap: 0.5rem; align-items: center; }
    .variation-row input {
      padding: 0.5rem 0.75rem; border: 1px solid #ddd; border-radius: 6px;
      font-size: .88rem; width: 100%;
    }
    .variation-row input:focus { outline: none; border-color: #1d3557; }
    .add-variation-btn {
      margin-top: 0.5rem; padding: 0.55rem 1rem; border: 1px dashed #1d3557;
      background: transparent; color: #1d3557; border-radius: 6px; cursor: pointer;
      font-size: .88rem; font-weight: 600; width: 100%; transition: background .15s;
    }
    .add-variation-btn:hover { background: #eef2ff; }

    /* ---- Footer ---- */
    .editor-footer {
      padding: 1rem 1.5rem; border-top: 1px solid #eee;
      display: flex; justify-content: flex-end; gap: 0.75rem; align-items: center;
    }
    .saving-spinner { color: #999; font-size: .9rem; }

    /* ---- Preview panel ---- */
    .preview-label {
      font-size: .72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; color: #aaa; margin-bottom: 0.75rem;
    }
    .preview-card {
      background: #fff; border-radius: 10px; overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,.1);
    }
    .preview-hero { width: 100%; height: 160px; object-fit: cover; display: block; }
    .preview-placeholder {
      width: 100%; height: 160px; background: #eee;
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem; color: #ccc;
    }
    .preview-body { padding: 0.9rem; }
    .preview-title { font-size: .95rem; font-weight: 700; color: #1a1a1a; margin-bottom: 0.5rem; line-height: 1.3; }
    .preview-title.empty { color: #ccc; font-weight: 400; font-style: italic; }
    .preview-prices { display: flex; gap: 0.5rem; align-items: baseline; flex-wrap: wrap; }
    .preview-old { text-decoration: line-through; color: #999; font-size: .85rem; }
    .preview-new { color: #e63946; font-weight: 700; font-size: 1.05rem; }
    .preview-badge {
      background: #e63946; color: #fff; font-size: .72rem; font-weight: 700;
      padding: 0.15rem 0.5rem; border-radius: 20px;
    }
    .preview-img-count { margin-top: 0.4rem; font-size: .78rem; color: #aaa; }
    .preview-hint { margin-top: 1rem; font-size: .78rem; color: #bbb; line-height: 1.5; text-align: center; }

    @media (max-width: 680px) {
      .editor-body { grid-template-columns: 1fr; }
      .editor-preview { display: none; }
    }
  `],
  template: `
    <div class="admin-section">
      <div class="section-header">
        <h1>Products</h1>
        <button class="btn btn-primary" (click)="openNew()">+ Add Product</button>
      </div>

      <!-- ── Editor Modal ── -->
      <div class="editor-overlay" *ngIf="showForm" (click)="onOverlayClick($event)">
        <div class="editor-modal" (click)="$event.stopPropagation()">

          <div class="editor-header">
            <h2>{{ editing ? 'Edit Product' : 'New Product' }}</h2>
            <button type="button" class="close-btn" (click)="reset()">×</button>
          </div>

          <form (ngSubmit)="save()">
            <div class="editor-body">

              <!-- Left: form -->
              <div class="editor-form">

                <div class="field-group">
                  <span class="field-label">Title</span>
                  <input type="text" placeholder="e.g. Samsung Galaxy A55 Pro"
                    [(ngModel)]="form.title" name="title" required />
                </div>

                <div>
                  <span class="field-label">Pricing</span>
                  <div class="price-grid" style="margin-top:.3rem">
                    <div class="field-group">
                      <span class="field-label" style="font-size:.75rem;text-transform:none">Original (KES)</span>
                      <div class="price-input-wrap">
                        <span class="price-prefix">KES</span>
                        <input type="number" placeholder="35000" [(ngModel)]="form.price" name="price" required min="0" />
                      </div>
                    </div>
                    <div class="field-group">
                      <span class="field-label" style="font-size:.75rem;text-transform:none">Sale price (KES)</span>
                      <div class="price-input-wrap">
                        <span class="price-prefix">KES</span>
                        <input type="number" placeholder="27000" [(ngModel)]="form.discountPrice" name="discountPrice" required min="0" />
                      </div>
                    </div>
                  </div>
                  <span class="savings-badge" *ngIf="savingsPercent > 0">
                    {{ savingsPercent }}% off &mdash; save KES {{ (form.price - form.discountPrice) | number:'1.0-0' }}
                  </span>
                </div>

                <div class="field-group">
                  <span class="field-label">Images</span>
                  <!-- Single hidden file input, shared across all rows -->
                  <input #fileInput type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                    style="display:none" (change)="onFileSelected($event)" />
                  <div class="img-list">
                    <div class="img-row" *ngFor="let url of imageUrls; let i = index">
                      <img *ngIf="url" [src]="url" class="img-thumb"
                        (error)="onImgError($event)" />
                      <div *ngIf="!url" class="img-thumb-placeholder">+</div>
                      <input type="url" placeholder="https://example.com/image.jpg"
                        [(ngModel)]="imageUrls[i]" [name]="'img_' + i" />
                      <button type="button" class="upload-btn"
                        [disabled]="uploadingIndex === i"
                        (click)="triggerUpload(i, fileInput)"
                        title="Upload from device">
                        {{ uploadingIndex === i ? '…' : '&#128247;' }}
                      </button>
                      <button type="button" class="remove-img" (click)="removeImage(i)"
                        title="Remove image">×</button>
                    </div>
                  </div>
                  <button type="button" class="add-img-btn" (click)="addImage()">
                    + Add Image URL
                  </button>
                </div>

                <div class="field-group">
                  <span class="field-label">Variations <span style="font-weight:400;text-transform:none;font-size:.78rem;color:#888">(optional — e.g. Grey, Black, Beige)</span></span>
                  <div class="variation-list">
                    <div class="variation-row" *ngFor="let v of variationLabels; let i = index">
                      <input type="text" placeholder="e.g. Grey" [(ngModel)]="variationLabels[i]" [name]="'var_' + i" />
                      <button type="button" class="remove-img" (click)="removeVariation(i)" title="Remove">×</button>
                    </div>
                  </div>
                  <button type="button" class="add-variation-btn" (click)="addVariation()">+ Add Variation</button>
                </div>

                <div class="field-group" style="flex-direction:row;align-items:center;gap:.6rem">
                  <input type="checkbox" id="ratingsEnabled" [(ngModel)]="form.ratingsEnabled" name="ratingsEnabled" style="width:16px;height:16px;cursor:pointer" />
                  <label for="ratingsEnabled" class="field-label" style="margin:0;cursor:pointer;text-transform:none;font-size:.9rem">Enable customer ratings &amp; reviews for this product</label>
                </div>

                <div class="field-group">
                  <span class="field-label">Description</span>
                  <app-rich-editor
                    [value]="form.description"
                    (valueChange)="form.description = $event">
                  </app-rich-editor>
                </div>

              </div>

              <!-- Right: live preview -->
              <div class="editor-preview">
                <div class="preview-label">Live Preview</div>
                <div class="preview-card">
                  <img *ngIf="firstValidImage" [src]="firstValidImage" class="preview-hero"
                    (error)="onImgError($event)" />
                  <div *ngIf="!firstValidImage" class="preview-placeholder">&#128247;</div>
                  <div class="preview-body">
                    <div class="preview-title" [class.empty]="!form.title">
                      {{ form.title || 'Product title…' }}
                    </div>
                    <div class="preview-prices" *ngIf="form.price || form.discountPrice">
                      <span class="preview-old" *ngIf="form.price">KES {{ form.price | number:'1.0-0' }}</span>
                      <span class="preview-new" *ngIf="form.discountPrice">KES {{ form.discountPrice | number:'1.0-0' }}</span>
                      <span class="preview-badge" *ngIf="savingsPercent > 0">-{{ savingsPercent }}%</span>
                    </div>
                    <div class="preview-img-count" *ngIf="validImageCount > 1">
                      +{{ validImageCount - 1 }} more image{{ validImageCount > 2 ? 's' : '' }}
                    </div>
                  </div>
                </div>
                <div class="preview-hint">Updates as you type</div>
              </div>

            </div>

            <div class="editor-footer">
              <button type="button" class="btn btn-secondary" (click)="reset()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                {{ saving ? 'Saving…' : (editing ? 'Update Product' : 'Create Product') }}
              </button>
            </div>
          </form>

        </div>
      </div>

      <!-- ── Products Table ── -->
      <table class="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Original</th>
            <th>Sale Price</th>
            <th>Images</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of products">
            <td>{{ p.title }}</td>
            <td>KES {{ p.price | number:'1.0-0' }}</td>
            <td>KES {{ p.discountPrice | number:'1.0-0' }}</td>
            <td>{{ p.imageUrls.length }}</td>
            <td>
              <div style="display:flex;gap:.4rem;flex-wrap:wrap">
                <a class="btn-sm" [routerLink]="['/products', p.id]" target="_blank">View</a>
                <button class="btn-sm" (click)="edit(p)">Edit</button>
                <button class="btn-sm danger" (click)="delete(p.id)">Delete</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="!products.length">
            <td colspan="5" class="empty">No products yet. Add one above.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  showForm = false;
  editing: Product | null = null;
  imageUrls: string[] = [''];
  variationLabels: string[] = [];
  saving = false;
  uploadingIndex = -1;
  private activeUploadIndex = -1;
  form: CreateProduct = { title: '', description: '', price: 0, discountPrice: 0, imageUrls: [], variations: [], ratingsEnabled: false };

  constructor(
    private productService: ProductService,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.productService.getAll().subscribe(p => {
      this.products = p;
      this.cdr.markForCheck();
    });
  }

  get savingsPercent(): number {
    if (!this.form.price || !this.form.discountPrice || this.form.discountPrice >= this.form.price) return 0;
    return Math.round((1 - this.form.discountPrice / this.form.price) * 100);
  }

  get validImageCount(): number {
    return this.imageUrls.filter(u => u.trim()).length;
  }

  get firstValidImage(): string {
    return this.imageUrls.find(u => u.trim()) ?? '';
  }

  openNew() {
    this.editing = null;
    this.form = { title: '', description: '', price: 0, discountPrice: 0, imageUrls: [], variations: [], ratingsEnabled: false };
    this.imageUrls = [''];
    this.variationLabels = [];
    this.showForm = true;
    this.cdr.markForCheck();
  }

  edit(p: Product) {
    this.editing = p;
    this.form = { title: p.title, description: p.description, price: p.price, discountPrice: p.discountPrice, imageUrls: [], variations: [], ratingsEnabled: p.ratingsEnabled };
    this.imageUrls = p.imageUrls.length ? [...p.imageUrls] : [''];
    this.variationLabels = p.variations?.map(v => v.label) ?? [];
    this.showForm = true;
    this.cdr.markForCheck();
  }

  addVariation() {
    this.variationLabels = [...this.variationLabels, ''];
    this.cdr.markForCheck();
  }

  removeVariation(i: number) {
    this.variationLabels = this.variationLabels.filter((_, idx) => idx !== i);
    this.cdr.markForCheck();
  }

  triggerUpload(i: number, fileInput: HTMLInputElement) {
    this.activeUploadIndex = i;
    fileInput.value = '';
    fileInput.click();
  }

  onFileSelected(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file || this.activeUploadIndex < 0) return;

    const idx = this.activeUploadIndex;
    this.uploadingIndex = idx;
    this.cdr.markForCheck();

    const fd = new FormData();
    fd.append('file', file);

    this.api.uploadFile<{ url: string }>('/uploads', fd).subscribe({
      next: res => {
        this.imageUrls[idx] = res.url;
        this.uploadingIndex = -1;
        this.cdr.markForCheck();
      },
      error: () => {
        this.uploadingIndex = -1;
        this.cdr.markForCheck();
      }
    });
  }

  addImage() {
    this.imageUrls = [...this.imageUrls, ''];
    this.cdr.markForCheck();
  }

  removeImage(i: number) {
    this.imageUrls = this.imageUrls.filter((_, idx) => idx !== i);
    if (!this.imageUrls.length) this.imageUrls = [''];
    this.cdr.markForCheck();
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).style.display = 'none';
  }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('editor-overlay')) this.reset();
  }

  save() {
    this.form.imageUrls = this.imageUrls.map(u => u.trim()).filter(Boolean);
    this.form.variations = this.variationLabels.map(v => v.trim()).filter(Boolean);
    this.saving = true;
    this.cdr.markForCheck();

    const done = () => { this.saving = false; this.reset(); this.load(); };

    if (this.editing) {
      this.productService.update(this.editing.id, this.form).subscribe({ next: done, error: () => { this.saving = false; this.cdr.markForCheck(); } });
    } else {
      this.productService.create(this.form).subscribe({ next: done, error: () => { this.saving = false; this.cdr.markForCheck(); } });
    }
  }

  delete(id: string) {
    if (confirm('Delete this product?')) {
      this.productService.delete(id).subscribe(() => this.load());
    }
  }

  reset() {
    this.showForm = false;
    this.editing = null;
    this.saving = false;
    this.form = { title: '', description: '', price: 0, discountPrice: 0, imageUrls: [], variations: [], ratingsEnabled: false };
    this.imageUrls = [''];
    this.variationLabels = [];
    this.cdr.markForCheck();
  }
}
