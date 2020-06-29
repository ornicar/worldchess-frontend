import {Component, OnInit} from '@angular/core';
import { AccountService } from '../../../../../account/account-store/account.service';

@Component({
  selector: 'wc-game-main-lobby',
  templateUrl: './game-main-lobby.component.html',
  styleUrls: ['./game-main-lobby.component.scss']
})
export class GameMainLobbyComponent implements OnInit {

  constructor(
    public accountService: AccountService
  ) {
  }

  ngOnInit() {
  }

}
