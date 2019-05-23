import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent implements OnInit {
  @Output() onClickLink = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }
}
