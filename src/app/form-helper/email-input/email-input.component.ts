import {Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-email-input',
  templateUrl: './email-input.component.html',
  styleUrls: ['./email-input.component.scss']
})
export class EmailInputComponent implements OnInit {

  @Input() label = 'E-mail address';
  @Input() responseError = '';
  @Input() email: FormControl;
  @Input() additionalText: string;
  @Input() original: string;

  isFocus = false;

  constructor() { }

  ngOnInit() {
    this.email.setValidators([Validators.required, Validators.email]);
  }

  getEmailError() {
    if (!this.isFocus) {
      return '';
    }
    if (this.responseError) {
      return this.responseError;
    }
    if (this.email.hasError('required')) {
      return 'required';
    }
    if (this.email.hasError('email')) {
      return 'invalid email';
    }
    return '';
  }

  isEdit(): boolean {
    return this.original !== this.email.value;
  }
}
