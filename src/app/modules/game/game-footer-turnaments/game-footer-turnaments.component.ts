import { AccountService } from './../../../account/account-store/account.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'wc-game-footer-turnaments',
  templateUrl: './game-footer-turnaments.component.html',
  styleUrls: ['./game-footer-turnaments.component.scss']
})
export class GameFooterTurnamentsComponent implements OnInit {

  window = window;

  constructor(
    public accountService: AccountService,
  ) { }

  ngOnInit() {
  }


}
