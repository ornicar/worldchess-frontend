import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'wc-chess-page-layout',
  templateUrl: './chess-page-layout.component.html',
  styleUrls: ['./chess-page-layout.component.scss']
})
export class ChessPageLayoutComponent {

  @Input()
  switched = false;
}
