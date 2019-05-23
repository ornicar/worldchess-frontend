import {Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-card-name-input',
  templateUrl: './card-name-input.component.html',
  styleUrls: ['./card-name-input.component.scss']
})
export class CardNameInputComponent implements OnInit {

  @Input() label = 'name on card';
  @Input() cardName: FormControl;

  isFocus = false;

  constructor() {
  }

  ngOnInit() {
    this.cardName.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z]+ [a-zA-Z\.]+( ([a-zA-Z]+))?$/)]);
  }

}
