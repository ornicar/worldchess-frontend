import {Component, OnInit} from '@angular/core';
import { AccountService } from '../../../../../account/account-store/account.service';

@Component({
  selector: 'wc-game-main-cards',
  templateUrl: './game-main-cards.component.html',
  styleUrls: ['./game-main-cards.component.scss']
})
export class GameMainBoardCardsComponent implements OnInit {

  constructor(
    public accountService: AccountService
  ) {
  }
  ngOnInit() {
  }

}
