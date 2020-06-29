import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-select-input',
  styleUrls: ['./select-input.component.scss'],
  templateUrl: './select-input.component.html',
  encapsulation: ViewEncapsulation.None
})
export class SelectInputComponent {
  @Input() label = '';
  @Input() options: any[];
  @Input() optionLabelField = 'label';
  @Input() optionValueField = 'value';
  @Input() responseError = '';

  @Input() original = null;
  @Input() disabled = false;

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
