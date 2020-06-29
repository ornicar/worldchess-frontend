import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  styleUrls: ['./text-input.component.scss'],
  templateUrl: './text-input.component.html'
})
export class TextInputComponent {
  @Input() label = '';
  @Input() responseError = '';
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

  getIcon() {
    if (this.disabled) {
      return 'lock';
    } else {
      return this.getError() ? 'input_error' : 'input_success';
    }
  }
}
