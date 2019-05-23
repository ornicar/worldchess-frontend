import {Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {FormValidatorsUtils} from '../../form-validators-utils';

@Component({
  selector: 'app-card-number-input',
  templateUrl: './card-number-input.component.html',
  styleUrls: ['./card-number-input.component.scss']
})
export class CardNumberInputComponent implements OnInit {

  @Input() label = 'card number';
  @Input() cardNumber: FormControl;

  isFocus = false;

  constructor() {
  }

  ngOnInit() {
    this.cardNumber.setValidators([
      Validators.required,
      FormValidatorsUtils.equalLengthValidator(15, 16)
    ]);
  }

}
