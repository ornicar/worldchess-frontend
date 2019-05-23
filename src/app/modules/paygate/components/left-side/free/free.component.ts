import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'wc-free',
  templateUrl: './free.component.html',
  styleUrls: ['./free.component.scss']
})
export class FreeComponent implements OnInit {

  @Output() mobileShowForm = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

}
