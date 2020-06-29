import { AccountService } from './../../../account/account-store/account.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'wc-game-footer',
  templateUrl: './game-footer.component.html',
  styleUrls: ['./game-footer.component.scss']
})
export class GameFooterComponent implements OnInit {

  window = window;

  constructor(
    public accountService: AccountService,
  ) { }

  ngOnInit() {
  }

}
