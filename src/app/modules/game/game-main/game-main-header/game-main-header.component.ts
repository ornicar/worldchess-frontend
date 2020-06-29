import { Component, OnInit } from '@angular/core';
import { AccountService } from './../../../../account/account-store/account.service';
@Component({
  selector: 'game-main-header',
  templateUrl: './game-main-header.component.html',
  styleUrls: ['./game-main-header.component.scss']
})
export class GameMainHeaderComponent implements OnInit {

  constructor(
    public accountService: AccountService
  ) { 
    
  }

  ngOnInit() {
  }

}
