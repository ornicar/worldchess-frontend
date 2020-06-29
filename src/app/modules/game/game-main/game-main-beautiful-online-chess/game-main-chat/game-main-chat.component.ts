import {Component, OnInit} from '@angular/core';
import { AccountService } from '../../../../../account/account-store/account.service';

@Component({
  selector: 'wc-game-main-chat',
  templateUrl: './game-main-chat.component.html',
  styleUrls: ['./game-main-chat.component.scss']
})
export class GameMainChatComponent implements OnInit {

  constructor(
    public accountService: AccountService
  ) {
  }

  ngOnInit() {
  }

}
