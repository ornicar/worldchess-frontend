import { AccountService } from './../../../../account/account-store/account.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IPlayerCompetitors } from '@app/modules/app-common/services/player-rating.model';
import { GamePlayerRatingService } from '@app/modules/game/service/game-player-rating-service';

@Component({
  selector: 'game-champions-table',
  templateUrl: './game-champions-table.component.html',
  styleUrls: ['./game-champions-table.component.scss']
})
export class GameChampionsTableComponent implements OnInit {

  constructor(
    private gamePlayerRatingService: GamePlayerRatingService,
    public accountService: AccountService
  ) {
  }

  rootOpen = false;

  bestPlayers$: Observable<IPlayerCompetitors[]>;

  ngOnInit() {
    this.bestPlayers$ = this.gamePlayerRatingService.getBest10Players('worldchess');
  }
}
