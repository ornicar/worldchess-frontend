import {Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {FormValidatorsUtils} from '../../form-validators-utils';

@Component({
  selector: 'app-card-cvc-input',
  templateUrl: './card-cvc-input.component.html',
  styleUrls: ['./card-cvc-input.component.scss']
})
export class CardCVCInputComponent implements OnInit {

  @Input() cardCVC: FormControl;

  isFocus = false;

  constructor() {}

  ngOnInit() {
    this.cardCVC.setValidators([Validators.required,
      FormValidatorsUtils.equalLengthValidator(3)]);
  }

}
