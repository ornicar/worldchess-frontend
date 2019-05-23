import {Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'wc-full-name-input',
  templateUrl: './full-name-input.component.html',
  styleUrls: ['./full-name-input.component.scss']
})
export class FullNameInputComponent implements OnInit {

  @Input() label = 'Full name';
  @Input() responseError = '';
  @Input() fullName: FormControl;
  @Input() original: string;

  isFocus = false;

  constructor() { }

  ngOnInit() {
    this.fullName.setValidators([Validators.required]);
  }

  getError() {
    if (!this.isFocus) {
      return '';
    }
    if (this.responseError) {
      return this.responseError;
    }
    if (this.fullName.hasError('required')) {
      return 'required';
    }

    return '';
  }

  isEdit(): boolean {
    return this.original !== this.fullName.value;
  }
}
