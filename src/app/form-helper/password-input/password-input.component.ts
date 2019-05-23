import {Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-password-input',
  templateUrl: './password-input.component.html',
  styleUrls: ['./password-input.component.scss']
})
export class PasswordInputComponent implements OnInit {

  hidePassword = true;

  @Input() label = 'Password';
  @Input() responseError = '';
  @Input() password: FormControl;
  @Input() additionalText: string;
  @Input() original: string;
  @Input() showError = true;

  isFocus = false;

  constructor() { }

  ngOnInit() {
    this.password.setValidators([Validators.required/*, Validators.pattern(/.{8}/)*/]);
  }

  getPasswordError() {
    if (!this.isFocus) {
      return '';
    }
    if (this.responseError) {
      return this.responseError;
    }
    if (this.password.hasError('required')) {
      return 'required';
    }
    if (this.password.hasError('pattern')) {
      return 'password should contain at least 8 symbols';
    }
    return '';
  }

  isEdit(): boolean {
    return this.original !== this.password.value;
  }
}
