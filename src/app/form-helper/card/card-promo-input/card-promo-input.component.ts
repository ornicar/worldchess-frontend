import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {PromoCodeStatus} from './promo-code-status';

@Component({
  selector: 'app-card-promo-input',
  templateUrl: './card-promo-input.component.html',
  styleUrls: ['./card-promo-input.component.scss']
})
export class CardPromoInputComponent implements OnInit {

  @Input() promoCode: FormControl;
  @Input() invalid: PromoCodeStatus;

  isFocus = false;

  constructor() {
  }

  ngOnInit() {
  }

  getPromoCodeStatus(): string {
    switch (this.invalid) {
      case PromoCodeStatus.NOT_USED: return '';
      case PromoCodeStatus.FAIL: return 'input_error';
      case PromoCodeStatus.SUCCESS: return 'input_success';
    }
  }
}
