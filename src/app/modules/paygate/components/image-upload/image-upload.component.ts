import {
  Component,
  ElementRef,
  forwardRef,
  HostListener, Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'wc-paygate-image-upload',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PaygateImageUploadComponent),
      multi: true
    }
  ],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class PaygateImageUploadComponent implements OnChanges, ControlValueAccessor {

  currentImage: string | ArrayBuffer = null;

  constructor(private renderer: Renderer2, private hostElement: ElementRef) {}

  @ViewChild('upload', { static: true }) uploadInput: ElementRef;
  @ViewChild('dropArea', { static: true }) dropArea: ElementRef;

  @Input() needSubtitle: boolean;
  @Input() maximumSizeExceededError: boolean;

  _needSubtitle = true;
  _maximumSizeExceededError = false;

  openFileDialog() {
    if (this.uploadInput && !this.currentImage) {
      this.uploadInput.nativeElement.click();
    }
  }

  @HostListener('dragover', ['$event']) onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.renderer.addClass(this.hostElement.nativeElement, 'drag-over');
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.renderer.removeClass(this.hostElement.nativeElement, 'drag-over');
  }

  @HostListener('drop', ['$event']) public ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.renderer.removeClass(this.hostElement.nativeElement, 'drag-over');
    const files = evt.dataTransfer.files;
    if (files.length > 0) {
      this.onFileSelected(files[0]);
    }
  }

  onFileChanged(event) {
    if (event.target.files.length) {
      const file = event.target.files[0];
      this.onFileSelected(file);
    }
  }

  onFileSelected(file: File) {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.currentImage = reader.result;
        this.writeValue(reader.result);
        this._maximumSizeExceededError = false;
      };
    }
  }

  removeImage() {
    this.uploadInput.nativeElement.value = '';
    this.writeValue('');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['needSubtitle']) {
      this._needSubtitle = changes['needSubtitle'].currentValue;
    }
    if (changes['maximumSizeExceededError']) {
      if (changes['maximumSizeExceededError'].currentValue) {
        this.removeImage();
        this._maximumSizeExceededError = true;
      }
    }
  }

  get value() {
    return this.currentImage;
  }

  set value(val) {
    this.currentImage = val;
    this.onChange(val);
    this.onTouched();
  }

  onChange: any = () => { };
  onTouched: any = () => { };

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  writeValue(value: string | ArrayBuffer = null) {
    this.value = value;
  }
}
