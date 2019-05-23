import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'wc-premium',
  templateUrl: './premium.component.html',
  styleUrls: ['./premium.component.scss']
})
export class PremiumComponent implements OnInit {

  @Output() mobileShowForm = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

}
