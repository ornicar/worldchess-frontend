import { selectMyAccount } from './../../../account/account-store/account.reducer';
import { distinctUntilChanged } from 'rxjs/operators';
import { selectToken } from './../../../auth/auth.reducer';
import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { GameState, OpponentMode } from '@app/modules/game/state/game.state';
import { combineLatest, interval, Observable, of, Subject } from 'rxjs';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { distinct, first, map, switchMap, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { select, Store as NGRXStore } from '@ngrx/store';
import * as fromAuth from '../../../auth/auth.reducer';
import {
  InviteCancelRequest,
  RequestInvite,
  RequestOpponent,
  ResetRematch,
  RestartGame,
  SetChatId,
  SetFlagRematch,
  SetFlagReplay,
  SetOpponentMode, SetOpponentTimer, SetPlayerTimer,
  SetReplayNotification, UpdateFinalTimer
} from '@app/modules/game/state/game.actions';
import { EOppMode } from '@app/modules/game/state/online-request-response.model';
import { EndReason } from '@app/modules/game/state/game-result-enum';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { OnlineTournamentResourceService } from '@app/modules/game/tournaments/providers/tournament.resource.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()

export class GameService {

  @Select(GameState.getRematchInvite) getRematchInvite$: Observable<string>;
  @Select(GameState.opponent) gameOpponent$: Observable<IPlayer>;
  @Select(GameState.opponentMode) gameOpponentMode$: Observable<OpponentMode>;
  @Select(GameState.getIsReplay) getIsReplay$: Observable<boolean>;
  @Select(GameState.getIsRematch) getIsRematch$: Observable<boolean>;
  @Select(GameState.endReason) endReason$: Observable<EndReason>;
  @Select(GameState.gameReady) gameReady$: Observable<boolean>;
  @Select(GameState.lastOpponentMode) lastOpponentMode$: Observable<OpponentMode>;
  @Select(GameState.isMyMove) isPlayerMove$: Observable<boolean>;
  @Select(GameState.playerTimer) playerTimer$: Observable<number>;
  @Select(GameState.opponentTimer) opponentTimer$: Observable<number>;
  @Select(GameState.gameInProgress) gameInProgress$: Observable<boolean>;

  destroyGameTimer$ = new Subject<void>();
  gameEnd$ = new Subject<void>();

  opponent$ = this.gameOpponent$.pipe(
    map(i => [i.full_name, i.uid])
  );

  private _isEnd: boolean;
  private gameTimer$ = new Subject();

  constructor(
    private store: Store,
    private gameResourceService: GameResourceService,
    private onlineTournamentResourceService: OnlineTournamentResourceService,
    private translateService: TranslateService,
    private authStore: NGRXStore<fromAuth.State>,
  ) {
    this.endReason$.subscribe(i => {
      if ([
        EndReason.TIME_CONTROL,
        EndReason.TIMEOUT,
        EndReason.CLASSIC,
        EndReason.DRAW,
        EndReason.DRAW_OFFER,
        EndReason.RESIGN,
        EndReason.FOLD_REPETITION,
      ].includes(i)) {
        this._isEnd = true;
      } else {
        this._isEnd = false;
      }
    });

    this.gameTimer$.pipe(
      withLatestFrom(this.isPlayerMove$, this.playerTimer$, this.opponentTimer$),
    ).subscribe(([_, playerMove, timer, opponentTimer]) => {
      if (playerMove) {
        this.store.dispatch(new SetPlayerTimer(--timer));
      } else {
        this.store.dispatch(new SetOpponentTimer(--opponentTimer));
      }
    });
  }

  isEnd(): boolean {
    return this._isEnd;
  }

  cancelRematch() {
    this.gameReady$.pipe(take(1)).subscribe((ready) => {
      this.store.dispatch(new InviteCancelRequest());
      this.store.dispatch(new ResetRematch());
    });
  }

  getChatID(boardId: string): Observable<string> {
    return this.gameResourceService.getChatId(boardId)
      .pipe(
        switchMap( (chatId) => {
            if (chatId) {
              this.store.dispatch(new SetChatId(chatId));
              return of(chatId);
            } else {
              return  of(null);
            }
        })
      );
  }

  getChatIDByTournament(tournamentID: number): Observable<string> {
    return this.onlineTournamentResourceService.getByChatID(tournamentID)
      .pipe(
        switchMap( (chatId) => {
          if (chatId) {
            this.store.dispatch(new SetChatId(chatId));
            return of(chatId);
          } else {
            return of(null);
          }
        })
      );
  }

  // TODO нужно как-то полностью перенести инициализацию таймера в сервис
  initGameTimer() {
    this.gameInProgress$.pipe(
      takeUntil(this.destroyGameTimer$)
    ).subscribe((gameInProgress) => {
      if (gameInProgress) {
        interval(1000).pipe(
          takeUntil(this.destroyGameTimer$),
          takeUntil(this.gameEnd$)
        ).subscribe(() => {
          this.gameTimer$.next();
        });
      } else {
        this.store.dispatch(new UpdateFinalTimer());
        this.gameEnd$.next();
      }
    });
  }

  rematch() {
    this.getRematchInvite$
    .pipe(
      first()
    )
    .subscribe(invite => {
      if (invite) {
        this.store.dispatch(new SetFlagRematch(true));
        this.store.dispatch(new RestartGame());
        this.store.dispatch(new RequestInvite(invite, EOppMode.FRIEND));
      } else {
        combineLatest([
          this.opponent$,
          this.lastOpponentMode$,
        ]).pipe(
          take(1)
        )
          .subscribe( ([i, opp]) => {
            this.translateService.get('MESSAGES.WAITING_FOR', {value: i[0]}).pipe(
              take(1)
            ).subscribe((msg) => {
              this.store.dispatch(new SetReplayNotification(msg));
            });
          this.store.dispatch(new SetFlagReplay(true));

          combineLatest([
            this.getIsReplay$.pipe(take(2)),
            this.gameReady$.pipe(take(1)),
          ]).pipe(
            distinct(),
            take(2),
          ).subscribe(([isReplay, ready]) => {
            if (!isReplay && ready) {
              this.store.dispatch(new RestartGame());
            } else {
              if ([OpponentMode.FRIEND, OpponentMode.HUMAN].includes(opp)) {
                this.store.dispatch(new SetOpponentMode(OpponentMode.FRIEND));
                this.store.dispatch(new RequestOpponent(i[1]));
              } else {
                this.store.dispatch(new SetOpponentMode(OpponentMode.BOT));
                this.store.dispatch(new RequestOpponent());
              }
            }
          });
        });
      }
    });
  }

  private getLocationMsg(code: string, ): Observable<string> {
    return this.translateService.get(code);
  }

  getToken(): Observable<string> {
    return this.authStore.pipe(
      select(selectToken)
    );
  }

  getAccountID(): Observable<number> {
    return this.authStore.pipe(
      select(selectMyAccount),
      distinctUntilChanged(),
      switchMap((i) => {  if (i) {
          return  of(i.id);
        } else {
          return of(0);
        }
      }),
    );
  }
}
