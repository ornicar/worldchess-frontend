import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-first-name-input',
  templateUrl: './first-name-input.component.html',
  styleUrls: ['./first-name-input.component.scss']
})
export class FirstNameInputComponent implements OnInit {

  @Input() label = 'first name';
  @Input() firstName: FormControl;
  @Input() original: string;
  @Input() isPremium: string;

  constructor() { }

  ngOnInit() {
  }

  isEdit(): boolean {
    return this.original !== this.firstName.value;
  }
}
