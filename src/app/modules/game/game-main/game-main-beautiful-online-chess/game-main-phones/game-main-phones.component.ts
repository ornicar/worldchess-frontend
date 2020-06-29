import {Component, OnInit} from '@angular/core';
import { AccountService } from '../../../../../account/account-store/account.service';

@Component({
  selector: 'wc-game-main-phones',
  templateUrl: './game-main-phones.component.html',
  styleUrls: ['./game-main-phones.component.scss']
})
export class GameMainPhonesComponent implements OnInit {

    constructor(
    public accountService: AccountService
  ) {
  }  
  
  ngOnInit() {
  }

}
