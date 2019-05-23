import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as fromRoot from '../../reducers';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { values } from 'd3-collection';


@Component({
  selector: 'wc-payment-info-form',
  templateUrl: './payment-info-form.component.html',
  styleUrls: ['./payment-info-form.component.scss']
})
export class PaymentInfoFormComponent {
  @Input() error: string = null;
  @Output() onEnter = new EventEmitter();

  @Input() showEmbedded = false;

  loading$: Observable<boolean>;

  public paymentInfoForm: FormGroup;

  months = moment.months().map((month, index) => ({ label: month, value: index + 1 }));
  years = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => { const value = moment().year() + i; return { label: value, value  } });

  constructor(private store$: Store<fromRoot.State>) {
    this.initForm();
  }

  initForm() {
    this.paymentInfoForm = new FormGroup({
      card_number: new FormControl('', [Validators.required]),
      cvc: new FormControl('', [Validators.required]),
      exp_month: new FormControl('', [Validators.required]),
      exp_year: new FormControl('', [Validators.required]),
      card_name: new FormControl('', [Validators.required])
    });
  }
}
