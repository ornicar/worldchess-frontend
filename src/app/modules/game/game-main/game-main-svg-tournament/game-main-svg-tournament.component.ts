import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../../../account/account-store/account.service';
@Component({
  selector: 'game-main-svg-tournament',
  templateUrl: './game-main-svg-tournament.component.html',
  styleUrls: ['./game-main-svg-tournament.component.scss']
})
export class GameMainSvgTournamentComponent implements OnInit {

  constructor(
    public accountService: AccountService
  ) { }

  ngOnInit() {
  }

}
