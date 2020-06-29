import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { GameState, PlayerType } from '@app/modules/game/state/game.state';
import { combineLatest, Observable } from 'rxjs';
import { GameResult } from '@app/modules/game/state/game-result-enum';
import { filter, map } from 'rxjs/operators';
import { IAccount } from '@app/account/account-store/account.model';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { GameRatingMode } from '@app/broadcast/core/tour/tour.model';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { Router } from '@angular/router';
import { AccountService } from './../../../../account/account-store/account.service';

@Component({
  selector: 'game-result',
  templateUrl: './game-result.component.html',
  styleUrls: ['./game-result.component.scss']
})
export class GameResultComponent implements OnInit {

  @Select(GameState.isResultShown) isResultShown$: Observable<boolean>;
  @Select(GameState.gameResult) gameResult$: Observable<GameResult>;
  @Select(GameState.ratingChange) ratingChange$: Observable<number>;
  @Select(GameState.account) account$: Observable<IAccount>;
  @Select(GameState.player) player$: Observable<IPlayer>;
  @Select(GameState.gameRatingMode) gameRatingMode$: Observable<GameRatingMode>;
  @Select(GameState.playerType) playerType$: Observable<PlayerType>;

  PlayerType = PlayerType;

  GameRatingMode = GameRatingMode;

  template$ = this.isResultShown$.pipe(
    filter(v => !!v),
  );

  constructor(
    private paygatePopupService: PaygatePopupService,
    private router: Router,
    public accountService: AccountService
  ) {
    this.account$.pipe(filter(a => !!a)).subscribe((account) => {
      return account.subscriptions;
    });
  }

  ngOnInit() {
  }

  navigateToFideRegister() {
    this.paygatePopupService.setState({ fideSelected: true });
    this.paygatePopupService.stepLoaded$.next('payment');
    this.router.navigate(['', { outlets: { p: ['paygate', 'payment']} }]);
  }
}
