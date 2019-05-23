import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-last-name-input',
  templateUrl: './last-name-input.component.html',
  styleUrls: ['./last-name-input.component.scss']
})
export class LastNameInputComponent implements OnInit {

  @Input() label = 'last name';
  @Input() lastName: FormControl;
  @Input() original: string;

  constructor() { }

  ngOnInit() {
  }

  isEdit(): boolean {
    return this.original !== this.lastName.value;
  }
}
