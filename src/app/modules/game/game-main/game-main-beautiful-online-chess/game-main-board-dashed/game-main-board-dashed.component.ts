import {Component, OnInit} from '@angular/core';
import { AccountService } from '../../../../../account/account-store/account.service';

@Component({
  selector: 'wc-game-main-board-dashed',
  templateUrl: './game-main-board-dashed.component.html',
  styleUrls: ['./game-main-board-dashed.component.scss']
})
export class GameMainBoardDashedComponent implements OnInit {

  constructor(
    public accountService: AccountService
  ) {
  }


  ngOnInit() {
  }

}
