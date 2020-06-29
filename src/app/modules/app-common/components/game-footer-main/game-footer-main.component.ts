import { AccountService } from '../../../../account/account-store/account.service';
import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'wc-game-footer-main',
  templateUrl: './game-footer-main.component.html',
  styleUrls: ['./game-footer-main.component.scss']
})
export class GameFooterMainComponent implements OnInit {

  window = window;

  selectLanguage =  false;

  constructor(
    public accountService: AccountService,
  ) { }

  ngOnInit() {
  }


  onSelectLanguage($event) {
    $event.preventDefault();
    this.selectLanguage = !this.selectLanguage;
  }

}
