import { AccountService } from './../../../account/account-store/account.service';
import { Component, OnInit } from '@angular/core';
import { OnlineTournamentResourceService } from '@app/modules/game/tournaments/providers/tournament.resource.service';

@Component({
  selector: 'game-main',
  templateUrl: './game-main.component.html',
  styleUrls: ['./game-main.component.scss']
})
export class GameMainComponent implements OnInit {

  constructor(
    public accountService: AccountService,
    private onlineTournamentService: OnlineTournamentResourceService
  ) {
  }

  ngOnInit() {
  }
}
