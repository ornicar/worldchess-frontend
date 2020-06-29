import {Component, OnInit} from '@angular/core';
import { AccountService } from './../../../../../account/account-store/account.service';

@Component({
  selector: 'wc-game-main-board-small',
  templateUrl: './game-main-board-small.component.html',
  styleUrls: ['./game-main-board-small.component.scss']
})
export class GameMainBoardSmallComponent implements OnInit {

  constructor(
    public accountService: AccountService
  ) {
  }

  ngOnInit() {
  }

}
