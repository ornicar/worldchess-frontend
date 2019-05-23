import {Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {FormValidatorsUtils} from '../../form-validators-utils';

@Component({
  selector: 'app-card-date-input',
  templateUrl: './card-date-input.component.html',
  styleUrls: ['./card-date-input.component.scss']
})
export class CardDateInputComponent implements OnInit {

  @Input() cardDate: FormControl;

  isFocus = false;

  constructor() {
  }

  ngOnInit() {
    this.cardDate.setValidators([Validators.required, FormValidatorsUtils.cardDateValidator()]);
  }

}
