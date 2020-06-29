import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { IOnlineTournamentStandings } from '@app/modules/game/tournaments/models/tournament.model';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { Component, OnDestroy, OnInit, Input, OnChanges } from '@angular/core';
import { Select } from '@ngxs/store';
import { GameState, PlayerType } from '@app/modules/game/state/game.state';
import { GameRatingMode } from '@app/broadcast/core/tour/tour.model';
import { BehaviorSubject, combineLatest, Observable, Subject, of } from 'rxjs';
import { GameResult } from '@app/modules/game/state/game-result-enum';
import { IAccount } from '@app/account/account-store/account.model';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { filter, takeUntil } from 'rxjs/operators';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { Router } from '@angular/router';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { OnlineTournamentService } from '@app/modules/game/tournaments/services/tournament.service';
import { TournamentGameState } from '@app/modules/game/tournaments/states/tournament.game.state';

/**
 * The component for viewing the result of the game.
 * @example
 * <tournament-game-result [standing]="standing"></tournament-game-result>
 * @export
 * @class TournamentGameResultComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 * @implements {OnChanges}
 */
@Component({
  selector: 'tournament-game-result',
  templateUrl: './tournament-game-result.component.html',
  styleUrls: ['./tournament-game-result.component.scss']
})
export class TournamentGameResultComponent implements OnInit, OnDestroy, OnChanges {
  @Select(GameState.isResultShown) isResultShown$: Observable<boolean>;
  @Select(GameState.gameResult) gameResult$: Observable<GameResult>;
  @Select(GameState.ratingChange) ratingChange$: Observable<number>;
  @Select(GameState.account) account$: Observable<IAccount>;
  @Select(GameState.player) player$: Observable<IPlayer>;
  @Select(GameState.gameRatingMode) gameRatingMode$: Observable<GameRatingMode>;
  @Select(GameState.playerType) playerType$: Observable<PlayerType>;

  @Select(TournamentGameState.tournamentId) tournamentId$: Observable<number>;
  @Select(TournamentGameState.isLastTour) isLastTour$: Observable<boolean>;

  PlayerType = PlayerType;
  GameRatingMode = GameRatingMode;

  /**
   * Destruction of the observer.
   * @type {Subject}
   * @memberof TournamentGameResultComponent
   */
  destroy$ = new Subject();

  /**
   * The result of the player
   * @type {IOnlineTournamentStandings}
   * @memberof TournamentGameResultComponent
   */
  @Input()
  standing: IOnlineTournamentStandings;

  /**
   * The result of the player
   * @type {Observable<IOnlineTournamentStandings>}
   * @memberof TournamentGameResultComponent
   */
  @OnChangesInputObservable('standing')
  standing$ = new BehaviorSubject<IOnlineTournamentStandings>(this.standing);
  isLoader = null;

  resultDelta = 0;

  /**
   * Creates an instance of TournamentGameResultComponent.
   * @param {PaygatePopupService} paygatePopupService
   * @param {Router} router
   * @param {GameResourceService} resource
   * @param {OnlineTournamentService} tournamentService
   * @param {ModalWindowsService} modalService
   * @memberof TournamentGameResultComponent
   */
  constructor(
    private paygatePopupService: PaygatePopupService,
    private router: Router,
    public tournamentService: OnlineTournamentService,
    private modalService: ModalWindowsService
  ) {
    this.account$.pipe(filter(a => !!a)).subscribe((account) => {
      return account.subscriptions;
    });
    /**
     * @todo неработает !(standing$ | async)
     */
    this.standing$.subscribe( (data) => {
      console.log(data);
      this.isLoader = data || null;
    });


  }

  showLoader() {
    return this.isLoader == null;
  }

  ngOnInit() {
    this.gameResult$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((result) => {
      switch (result) {
        case GameResult.WON:
          this.resultDelta = 1;
          break;
        case GameResult.DRAW:
          this.resultDelta = 0.5;
          break;
        case GameResult.LOST:
          this.resultDelta = 0;
          break;
      }
    });
  }

  /**
   * Return to the tournament lobby
   * @memberof GameMenuTournamentInfoComponent
   */
  goToLobby() {
    this.tournamentId$.pipe(
      takeUntil(this.destroy$)
    ).subscribe( (tournamentId) => {
      this.modalService.closeAll();
      this.router.navigate([`/tournament/${tournamentId}`]).then(() => {});
    });
  }

  navigateToFideRegister() {
    this.paygatePopupService.setState({ fideSelected: true });
    this.paygatePopupService.stepLoaded$.next('payment');
    this.router.navigate(['', { outlets: { p: ['paygate', 'payment']} }]);
    this.modalService.closeAll();
  }

  @OnChangesObservable()
  ngOnChanges() {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
