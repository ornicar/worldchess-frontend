import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { MatCheckboxChange } from '@angular/material';

@Component({
  selector: 'wc-checkbox-control',
  templateUrl: './checkbox-control.component.html',
  styleUrls: ['./checkbox-control.component.scss']
})
export class CheckboxControlComponent implements OnInit {
  @Input() label = '';
  @Input() control: FormControl;

  @Output() onChange = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  changed(changes: MatCheckboxChange) {
    this.onChange.emit(changes.checked);
  }
}
