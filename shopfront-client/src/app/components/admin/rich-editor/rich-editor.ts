import {
  Component, Input, Output, EventEmitter,
  ViewChild, ElementRef, OnInit, OnChanges, SimpleChanges,
  NgZone, ChangeDetectionStrategy
} from '@angular/core';
import Quill from 'quill';

@Component({
  selector: 'app-rich-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #host></div>`,
  styles: [`
    :host { display: block; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
    :host ::ng-deep .ql-toolbar { border: none; border-bottom: 1px solid #ddd; background: #fafafa; }
    :host ::ng-deep .ql-container { border: none; font-size: 1rem; }
    :host ::ng-deep .ql-editor { min-height: 220px; line-height: 1.7; }
  `]
})
export class RichEditorComponent implements OnInit, OnChanges {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  private quill!: Quill;
  private isInternalChange = false;

  constructor(private zone: NgZone) {}

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.quill = new Quill(this.host.nativeElement, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['clean']
          ]
        }
      });

      if (this.value) {
        this.quill.clipboard.dangerouslyPasteHTML(this.value);
      }

      this.quill.on('text-change', () => {
        const html = this.quill.root.innerHTML;
        setTimeout(() => {
          this.isInternalChange = true;
          this.zone.run(() => this.valueChange.emit(html));
        }, 0);
      });
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isInternalChange) {
      this.isInternalChange = false;
      return;
    }
    if (changes['value'] && this.quill) {
      this.zone.runOutsideAngular(() => {
        this.quill.clipboard.dangerouslyPasteHTML(this.value ?? '');
      });
    }
  }
}
