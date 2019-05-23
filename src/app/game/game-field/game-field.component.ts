import { Component, ViewChild } from '@angular/core';
import { IMovePosition, IMove } from '../../../app/broadcast/move/move.model';
import { Store, Select } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { AddNewMove, RequestOpponent, RestartGame, CallAnArbiter } from '../state/game.actions';
import { GameState } from '../state/game.state';
import { IGameBoard } from '../state/game-board.model';
import { ChessColors } from '../chess-board/chess-board.component';
import { PlayerPanelPosition } from '../player-panel/player-panel.component';
import { IGameMove } from '../state/game-move.model';
import { IPlayer } from '../../../app/broadcast/core/player/player.model';
import { EndReason, GameResult } from '../state/game-result-enum';
import { delay, map, filter } from 'rxjs/operators';
import { IAccount } from '../../account/account-store/account.model';
import { MoveTimerComponent } from '../chess-board/move-timer/move-timer.component';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';

@Component({
  selector: 'game-field',
  templateUrl: 'game-field.component.html',
  styleUrls: ['game-field.component.scss']
})
export class GameFieldComponent {
  @Select(GameState.board) board$: Observable<IGameBoard[]>;
  @Select(GameState.moves) moves$: Observable<IMove[]>;
  @Select(GameState.lastMove) lastMove$: Observable<IMove>;
  @Select(GameState.playerColor) playerColor$: Observable<ChessColors>;
  @Select(GameState.isMyMove) isMyMove$: Observable<boolean>;
  @Select(GameState.gameReady) gameReady$: Observable<boolean>;
  @Select(GameState.player) player$: Observable<IPlayer>;
  @Select(GameState.opponent) opponent$: Observable<IPlayer>;
  @Select(GameState.isResultShown) _isResultShown$: Observable<boolean>;
  isResultShown$ = this._isResultShown$.pipe(delay(1000));
  @Select(GameState.gameResult) gameResult$: Observable<GameResult>;
  @Select(GameState.endReason) endReason$: Observable<EndReason>;
  @Select(GameState.ratingChange) ratingChange$: Observable<number>;
  @Select(GameState.selectedMove) selectedMove$: Observable<IGameMove>;
  @Select(GameState.playerTimer) playerTimer$: Observable<number>;
  @Select(GameState.opponentTimer) opponentTimer$: Observable<number>;
  @Select(GameState.account) account$: Observable<IAccount>;
  @Select(GameState.pgnUrl) pgnUrl$: Observable<string>;
  @Select(GameState.canCallAnArbiter) canCallAnArbitter$: Observable<boolean>;

  activeMove$ = combineLatest(
    this.lastMove$,
    this.selectedMove$,
  ).pipe(
    map(([last, selected]) => selected || last)
  );

  readOnly$ = combineLatest(
    this.isMyMove$,
    this.selectedMove$,
  ).pipe(
    map(([isMyMove, selected]) => !isMyMove || selected)
  );

  isActiveMyTimer$ = combineLatest(
    this.isMyMove$,
    this.gameResult$,
  ).pipe(
    map(([isMyMove, result]) => !!isMyMove && !result),
  );

  isActiveCompetitorTimer$ = combineLatest(
    this.isMyMove$,
    this.gameResult$,
  ).pipe(
    map(([isMyMove, result]) => !isMyMove && !result),
  );

  @ViewChild('opponentTimer')
  opponentTimerComponent: MoveTimerComponent;

  @ViewChild('playerTimer')
  playerTimerComponent: MoveTimerComponent;

  playerPanelPositions = PlayerPanelPosition;

  public opponentName$: Observable<string> = this.opponent$.pipe(
    map(opponent => opponent && (opponent.nickname || opponent.full_name))
  );

  public playerName$: Observable<string> = this.player$.pipe(
    map(player => player && (player.nickname || player.full_name))
  );

  constructor(
    private store: Store,
    private modalService: ModalWindowsService,
  ) {
    // невероятный костыль для устранения последствий лага
    // если игра закончилась по таймауту, то сбрасываем таймер того, кто проиграл.
    combineLatest(
      this.gameResult$,
      this.endReason$
    ).pipe(
      filter(([result, reason]) => Boolean(result) && reason === EndReason.TIME_CONTROL)
    ).subscribe(([result, reason]) => {
      if (result === GameResult.WON) {
        this.opponentTimerComponent.startTime = 0;
        this.opponentTimerComponent.resetTimer();
      }

      if (result === GameResult.LOST) {
        this.playerTimerComponent.startTime = 0;
        this.playerTimerComponent.resetTimer();
      }
    });
   }

  public move(position: IMovePosition) {
    const move: IGameMove = Object.assign({
      created: (new Date()).toString(),
    }, position);

    this.store.dispatch(new AddNewMove(move));
  }

  public startNewGame(): void {
    this.store.dispatch(new RestartGame());
    this.store.dispatch(new RequestOpponent());
  }

  public onCallAnArbier() {
    this.store.dispatch(new CallAnArbiter());
    this.modalService.alert('Abuse report', 'Thank you for your feedback. We will investigate your message about unfair play!');
  }
}
