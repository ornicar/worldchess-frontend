import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-text-input',
    templateUrl: './text-input.component.html'
})
export class TextInputComponent {
  @Input() label = '';
  @Input() responseError = '';
  @Input() original = '';

  isFocus = false;

  @Input() control: FormControl;

  getError() {
    if (!this.isFocus) {
      return '';
    }
    if (this.responseError) {
      return this.responseError;
    }
    if (this.control.hasError('required')) {
      return 'required';
    }

    return '';
  }

  isEdit(): boolean {
    return this.original !== this.control.value;
  }
}
