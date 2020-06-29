import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD MMM, YYYY',
  },
  display: {
    dateInput: 'DD MMM, YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD MMM, YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'wc-datepicker-input',
  templateUrl: './datepicker-input.component.html',
  styleUrls: ['./datepicker-input.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class DatepickerInputComponent {

  @Input() label = 'Date';
  @Input() control: FormControl;
  @Input() responseError = '';
  @Input() disabled = false;

  isFocus = false;

  get error() {
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
}
