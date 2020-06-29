import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SocketConnectionService } from '@app/auth/socket-connection.service';
import { Store } from '@ngxs/store';
import { select, Store as NgrxStore, Store as NGRXStore } from '@ngrx/store';
import * as fromAuth from '../../../auth/auth.reducer';
import * as fromAccount from '../../../account/account-store/account.reducer';
import { SocketType } from '@app/auth/auth.model';
import {
  AddGameBoard,
  AddNewMove,
  GameBoardCreated,
  GameError,
  GameReady,
  InitRatingRange,
  OpponentOfferADraw,
  ResetRematch,
  RestartGame,
  SetAccount,
  SetAccountRating,
  SetBoardSubscribed, SetConnectionActive,
  SetDefaultNewMessage,
  SetGameResult,
  SetNotification,
  SetOnlineRatings,
  SetOpponentTimer,
  SetPgnUrl,
  SetPlayerTimer,
  SetRatingChange,
  SetRematchInvite,
  SetTimeControls,
  SetTimeLimitNotification,
  SetTimerInitializedInMoves,
  ShowGameResult,
  SocketMessage,
  SetChatId, SetSelectedTimeControl,
} from './game.actions';
import { ActionSource } from './action-source.enum';
import { IGameBoard } from './game-board.model';
import { IGameMove } from './game-move.model';
import {
  bufferCount,
  catchError,
  delay,
  distinct, distinctUntilChanged,
  filter,
  first,
  map,
  mapTo,
  mergeMap, skip, skipWhile, switchMap,
  take, takeUntil,
  tap, throttle, throttleTime, withLatestFrom,
} from 'rxjs/operators';
import { GameSocketActions } from './game-socket-actions.enum';
import { IGameAddMove, IGameCancelDraw, IGameDraw, IGameMessage, IGameMoves, IGameResign } from './game-socket-message.models';
import { environment } from '../../../../environments/environment';
import {
  EDesiredColor,
  EOppMode,
  IChatID,
  IOnlineRequestResponse,
  IRequestInvite,
  IResponseInvite,
  OnlineRequestResponseStatus
} from './online-request-response.model';
import { BehaviorSubject, concat, interval, Observable, of, Subject, Subscription, EMPTY, combineLatest, asyncScheduler } from 'rxjs';
import { EndReason } from './game-result-enum';
import { Result } from '@app/broadcast/core/result/result.model';
import { GameSocketMessagesHistoryDirections } from './game-socket-messages-history.model';
import { ITimeControl } from '@app/broadcast/core/tour/tour.model';
import { TypeOfBug } from '@app/modal-windows/bug-report-window/type-of-bug.enum';
import { GameState, IGameState, IOnlineRating, OpponentMode } from '@app/modules/game/state/game.state';
import { IGameHistoryResponse } from '@app/modules/game/state/game-history-response.model';
import { IPlayerInQueue } from '@app/modules/game/state/player-queue-response.model';
import { IOnlineTournament, IOnlineTournamentResponse, IOnlineTournamentStandings } from '@app/modules/game/tournaments/models/tournament.model';
import { Router } from '@angular/router';
import {
  SetOpponentHasLeft,
  SetPlayerHasLeft,
  SetTourEnd, SetTourJustFinishedFlag,
  SetTourSuccessfullyStarted
} from '@app/modules/game/tournaments/states/tournament.actions';
import { ChessColors } from '@app/modules/game/state/game-chess-colors.model';
import { RatingMode, TimeLimitWarningType } from '@app/modules/game/state/game.model';
import { SocketStatus } from '@app/shared/socket/socket-connection';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { AuthSetSocketReconnectingFlag } from '@app/auth/auth.actions';
import * as forRoot from '@app/reducers';
import { TournamentService } from '@app/modules/app-common/services/tournament.service';
import { SocketService } from '@app/shared/socket/socket.service';

@Injectable()
export class GameResourceService {
  static readonly pingInterval = 1000;
  private userUID: string;
  private pingIntervalSub: Subscription;

  private account$ = this.accStore.pipe(
    select(fromAccount.selectMyAccount),
  );

  private accountRating$ = this.accStore.pipe(
    select(fromAccount.selectMyAccountRating),
  );

  constructor(
    private httpClient: HttpClient,
    private store: Store,
    private authStore: NGRXStore<fromAuth.State>,
    private accStore: NGRXStore<fromAccount.State>,
    private store$: NgrxStore<forRoot.State>,
    private router: Router,
    private modalWindowService: ModalWindowsService,
    private tournamentService: TournamentService,
    private translateService: TranslateService,
    // private socket: SocketService<IGameMessage>,
    private socket: SocketConnectionService<IGameMessage, IGameMessage>,
  ) {


    // TODO это новые сокеты
    // this.socket.ping$.pipe(
    //   // TODO эта штука для того чтобы мы "бесшовно" переподключились, юзер не узнал бы об этом
    //   switchMap(online => of(online).pipe(delay(online ? 0 : 3000))),
    // ).subscribe((online) => {
    //   this.store.dispatch([new SetConnectionActive(!online), new SetConnectionActive(online)]);
    // });

    this.startPing();

    this.socket.status$.pipe(
      skip(1),
      distinctUntilChanged(),
      withLatestFrom(this.authStore.select(fromAuth.selectIsAuthSocketReconnecting))
    ).subscribe(([status, authSocketReconnect]) => {
      switch (status) {
        case SocketStatus.CONNECTED:
          this.store.dispatch(new SetConnectionActive(true));
          this.modalWindowService.closeAll();
          if (authSocketReconnect) {
            setTimeout(() => {
              this.store$.dispatch(new AuthSetSocketReconnectingFlag({flag: false}));
            }, 0);
          }
          break;
        case SocketStatus.DISCONNECTED:
        case SocketStatus.DISCONNECTING:
          if (!authSocketReconnect) {
            this.store.dispatch(new SetConnectionActive(false));
          }
          break;
      }
    });

    this.authStore.select(fromAuth.selectUID)
      .pipe(
        filter(uid => !!uid),
        distinct()
      )
      .subscribe(uid => {
        // TODO action
        this.store.dispatch({
          uid,
          type: 'Set uid',
        });

        this.userUID = uid;
      });

    this.account$.pipe(
      distinctUntilChanged()
    ).subscribe((acc) => {
      setTimeout(() => {
        this.store.dispatch(new SetAccount(acc));
      }, 0);
    });

    this.accountRating$.pipe(
      filter((accountRating) => !!accountRating),
      take(1)
    ).subscribe((rating) => {
      this.store.dispatch(new SetAccountRating(rating));
      this.store.dispatch(new InitRatingRange());
    });

    this.socket.messages$
      .pipe(
        filter(message => message.action !== GameSocketActions.GAMING_PONG),
        map((message) => {

          const tournamentData = this.store.snapshot()['TournamentGameState'];
          const gamingData = this.store.snapshot()['GameState'];

          if (message.action === GameSocketActions.GAMING_ERROR_GAME_ENDED) {
            if (gamingData['board'] && gamingData['board'].id === message.board_id
              || tournamentData['currentActiveBoardId'] === message.board_id) {
              this.store.dispatch(new RestartGame());
              if (this.router.url.indexOf('/tournament/pairing/') > -1 && message.action === GameSocketActions.GAMING_ERROR_GAME_ENDED) {
                this.router.navigate([`/tournament/${tournamentData.tournamentId}`]).then(() => {
                });
              }
            }
            return message;
          }

          // this.store.dispatch(new SocketMessage(
          //   GameSocketMessagesHistoryDirections.INCOMING,
          //   message,
          // ));

          if (message.action === GameSocketActions.PLAYER_READY && message['message_type'] === SocketType.GAMING) {
            this.getChatId(message.board_id).pipe(
              filter((chatId => !!chatId)),
              take(1)
            ).subscribe((chatID) => {
              this.store.dispatch(new SetChatId(chatID));
              this.store.dispatch(new SetDefaultNewMessage());
            });
          }

          const board = this.store.snapshot()['GameState'].board;
          const rematchInvite = this.store.snapshot()['GameState'].rematchInvite;
          const isReplay = this.store.snapshot()['GameState'].isReplay;

          if (message['message_type'] === SocketType.GAMING) {
            if (board) {

              if (!message['board_id'] && message['action'] === GameSocketActions.GAMING_MOVES) {
                message = { // TODO полечить на бэке
                  ...message,
                  board_id: board.id,
                } as IGameMoves;
              }

              if (message.action === GameSocketActions.REMATCH_OFFERED) {
                return message;
              }

              if (board.id === message['board_id']) {
                return message;
              } else {
                if (isReplay === true || rematchInvite) {
                  return message;
                } else {
                  return null;
                }
              }
            } else {
              if ([
                GameSocketActions.GAMING_BOARD_CREATED,
                GameSocketActions.CANCEL_INVITE,
                GameSocketActions.TOUR_BOARD_CREATED,
                GameSocketActions.PLAYER_BOARD_CREATED].includes(message.action)) {
                return message;
              } else {
                return null;
              }
            }
          } else {
            return null;
          }
        }),
        filter(v => !!v),
      ).subscribe((message: IGameMessage) => {

      let notifies = {};
      const tournamentData = this.store.snapshot()['TournamentGameState'];
      const gamingData = this.store.snapshot()['GameState'];

      switch (message.action) {
        case GameSocketActions.GAMING_ADD_MOVE:
          this.store.dispatch(new AddNewMove(message.move, ActionSource.WEBSOCKET));
          break;

        case GameSocketActions.GAMING_ERROR:
          this.store.dispatch(new GameError(message.text));
          if (!tournamentData.tourSuccessfullyStarted) {
            this.store.dispatch(new SetTourEnd());
          }
          break;

        case GameSocketActions.GAMING_BOARD_CREATED:
          this.store.dispatch(new GameBoardCreated(
            message.board_id,
            message.jwt,
            message.white_player.uid));
          break;

        case GameSocketActions.GAMING_GAME_STARTED:
          this.store.dispatch(new GameReady());
          this.translateService.get('MESSAGES.PLAYERS_READY').pipe(take(1))
            .subscribe((msg) => this.store.dispatch(new SetNotification(msg)));
          if (tournamentData.tourStarted) {
            this.store.dispatch(new SetTourSuccessfullyStarted());
          } else {
            this.store.dispatch(new SetTourJustFinishedFlag(false));
          }
          break;

        case GameSocketActions.GAMING_GAME_END:
          if (gamingData['board'] && gamingData['board'].id === message.board_id
            || tournamentData['currentActiveBoardId'] === message.board_id) {

            this.store.dispatch(new SetGameResult(message.result, message.reason || EndReason.CLASSIC));
            this.store.dispatch(new ShowGameResult());
            this.store.dispatch(new SetTourEnd());
            // TODO костыль
            combineLatest([
                this.translateService.get(`MESSAGES.WHITE_RESIGNED`),
                this.translateService.get(`MESSAGES.BLACK_RESIGNED`),
                this.translateService.get(`MESSAGES.BLACK_WINS`),
                this.translateService.get(`MESSAGES.WHITE_WINS`),
                this.translateService.get(`MESSAGES.IT_DRAW`)]
            ).pipe(
              take(1)
            ).subscribe(([WHITE_RESIGNED, BLACK_RESIGNED, BLACK_WINS, WHITE_WINS, IT_DRAW]) => {
              notifies = {
                [Result.BLACK_WIN]: BLACK_WINS,
                [Result.WHITE_WIN]: WHITE_WINS,
                [Result.DRAW]: IT_DRAW,
              };

              if (message.reason === EndReason.RESIGN) {
                notifies = {
                  [Result.BLACK_WIN]: WHITE_RESIGNED,
                  [Result.WHITE_WIN]: BLACK_RESIGNED,
                };
              }
              this.store.dispatch(new SetNotification(notifies[message.result] || null));
            });
            if (message.reason === EndReason.DISCONNECT) {
              if (this.router.url.indexOf('/tournament/pairing/') > -1) {
                this.router.navigate([`/tournament/${tournamentData.tournamentId}`]).then(() => {
                });
                this.store.dispatch(new SetOpponentHasLeft(true));
              }
            }
            // this.stopPing();
          }
          break;

        case GameSocketActions.GAMING_GAME_ABORT:
          if (gamingData['board'] && gamingData['board'].id === message.board_id
            || tournamentData['currentActiveBoardId'] === message.board_id) {
            const playerColor = this.store.snapshot()['GameState'].playerColor;
            this.store.dispatch(new ResetRematch());
            this.store.dispatch(new RestartGame());
            this.store.dispatch(new SetGameResult(Result.NOT_PLAYED, EndReason.ABORT));
            this.store.dispatch(new ShowGameResult());
            this.store.dispatch(new SetTourEnd());
            this.translateService.get(`MESSAGES.GAME_ABORTED`)
              .pipe(take(1))
              .subscribe((msg) => {
                this.store.dispatch(new SetNotification(msg));
              });
            if (this.router.url.indexOf('/tournament/pairing/') > -1) {
              if (message.result === Result.WHITE_WIN) {
                if (playerColor === ChessColors.White) {
                  this.store.dispatch(new SetOpponentHasLeft(true));
                } else {
                  this.store.dispatch(new SetPlayerHasLeft(true));
                }
              } else {
                if (playerColor === ChessColors.Black) {
                  this.store.dispatch(new SetOpponentHasLeft(true));
                } else {
                  this.store.dispatch(new SetPlayerHasLeft(true));
                }
              }
              this.router.navigate([`/tournament/${tournamentData.tournamentId}`]).then(() => {
              });
            }
            // this.stopPing();
          }
          break;

        case GameSocketActions.GAMING_MOVES:
          let snapshot = this.store.snapshot();
          let gameState: IGameState = snapshot['GameState'];
          this.store.dispatch(new AddGameBoard(
            {
              ...gameState.board,
              moves: message.moves,
            }
          )).pipe(take(1)).subscribe(() => {
            snapshot = this.store.snapshot();
            gameState = snapshot['GameState'];
            this.store.dispatch(new SetTimerInitializedInMoves(true));
            if (message.white_seconds_left >= 0) {
              if (gameState.playerColor === ChessColors.White) {
                this.store.dispatch(new SetPlayerTimer(message.white_seconds_left));
              } else {
                this.store.dispatch(new SetOpponentTimer(message.white_seconds_left));
              }
            }

            if (message.black_seconds_left >= 0) {
              if (gameState.playerColor === ChessColors.Black) {
                this.store.dispatch(new SetPlayerTimer(message.black_seconds_left));
              } else {
                this.store.dispatch(new SetOpponentTimer(message.black_seconds_left));
              }
            }
          });

          break;

        case GameSocketActions.GAMING_RATING_CHANGE:
          this.store.dispatch(new SetRatingChange(message.rating_change, message.user_uid, message.board_id));
          this.store.dispatch(new ShowGameResult());
          break;

        case GameSocketActions.GAMING_DRAW_OFFER:
          this.store.dispatch(new OpponentOfferADraw(true));
          break;

        case GameSocketActions.GAMING_CANCEL_DRAW_OFFER:
          this.store.dispatch(new OpponentOfferADraw(false));
          break;

        case GameSocketActions.GAMING_PGN_CREATED:
          this.store.dispatch(new SetPgnUrl(message.url, message.board_id, message.pgn_download_name));
          break;

        case GameSocketActions.GAMING_SUBSCRIBE_TO_BOARD:
          this.store.dispatch(new SetBoardSubscribed(true));
          break;

        case GameSocketActions.GAME_DISCONNECT:
          this.translateService.get(`MESSAGES.OPPONENT_LEFT`).pipe(
            take(1)
          ).subscribe((msg) => this.store.dispatch(new SetNotification(msg)));
          break;

        case GameSocketActions.GAME_WARNING:
          this.store.dispatch(new SetTimeLimitNotification(TimeLimitWarningType.IdleTimeLimitWarning, message.thinking_user));
          break;

        case GameSocketActions.GAME_END_WARNING:
          this.store.dispatch(new SetTimeLimitNotification(TimeLimitWarningType.EndGameTimeLimitWarning, message.recipient));
          break;

        case GameSocketActions.GAME_END_CANCEL_WARNING:
          this.store.dispatch(new SetTimeLimitNotification(TimeLimitWarningType.NoTimeLimitWarning, message.recipient));
          break;

        case GameSocketActions.CANCEL_INVITE:
          const inviteRematch = this.store.snapshot()['GameState'].rematchInvite;
          if (inviteRematch) {
            this.store.dispatch(new ResetRematch());
          } else {
            this.store.dispatch(new ResetRematch());
            this.store.dispatch(new RestartGame());
            this.store.dispatch(new ShowGameResult());
            this.translateService.get(`MESSAGES.YOUR_OPPONENT`).pipe(
              take(1)
            ).subscribe((msg) => this.store.dispatch(new SetNotification(msg)));
          }
          break;

        case GameSocketActions.REMATCH_OFFERED:
          this.store.dispatch(new SetRematchInvite(message.invite_code));
          break;


        default:
          break;
      }
    });
  }

  public addNewMove(boardId: IGameBoard['id'], move: IGameMove): void {
    const message: IGameAddMove = {
      action: GameSocketActions.GAMING_ADD_MOVE,
      message_type: SocketType.GAMING,
      board_id: boardId,
      move,
    };

    this.sendSocketMessage(message);
  }

  /**
   * player_uid*  string pattern: [0-9a-f]{64}
   * rating  string
   * Array [ 3 ]
   * time_control  integer
   * default: 1
   * rating_limits  { default: 1 upper	integer default: 4000 bounds	string default: [)
   * desired_color	string  default: white Enum: [ white, black ]
   */
  public requestOpponent(
    timeControl: number,
    rating: string,
    opponentMode: string,
    ratingLimits: { lower: number, upper: number },
    oppUID?: string,
  ): Observable<IOnlineRequestResponse> {
    const params = {
      player_uid: this.userUID,
      time_control: [timeControl],
      rating: [rating],
      rating_limits: ratingLimits
    };
    // TODO: Maybe, do to transfer in the utility module.
    const randomEnumValue = (enumeration) => {
      const values = Object.keys(enumeration);
      const enumKey = values[Math.floor(Math.random() * values.length)];
      return enumeration[enumKey];
    };

    if (opponentMode) {
      params['opp_mode'] = opponentMode;
    }

    if (opponentMode === EOppMode.BOT) {
      params['desired_color'] = randomEnumValue(EDesiredColor);
    }

    if (oppUID) {
      params['opp_uid'] = oppUID;
    }

    const attempts = [10, 10, 10, 10, 10, 1, 1, 1, 1, 1];

    return this.httpClient
      .post<IOnlineRequestResponse>(`${environment.endpoint}/online/request/`, params)
      .pipe(
        map((response) => {
          return {
            ...response,
            responseStatus: OnlineRequestResponseStatus.Success
          };
        }),
        catchError((err, caught) => {
          if (attempts.length) {
            return concat(
              of({
                responseStatus: OnlineRequestResponseStatus.SendingAttempts
              }).pipe(delay(attempts.pop() * 1000)),
              caught
            );
          }
          return of({
            responseStatus: OnlineRequestResponseStatus.Fail
          });
        })
      );
  }

  public requestInvite(
    inviteCode: string,
    uid: string,
    oppMode: EOppMode
  ): Observable<IResponseInvite> {
    const params: IRequestInvite = {
      player_uid: uid,
      invite_code: inviteCode,
      opp_mode: oppMode
    };
    return this.httpClient
      .post<IRequestInvite>(`${environment.endpoint}/online/request/invite/`, params)
      .pipe(
        map((response) => ({...response})),
        catchError((err, caught) => {
            return this.getLocationErrorMsg(err.error.code).pipe(
              map((msg) => {
                return {
                  errorCode: err.status,
                  errorMsg: msg
                };
              }));
          }
        )
      );
  }

  public getBoard(boardId: string): Observable<IGameBoard> {
    return this.httpClient.get<IGameBoard>(`${environment.endpoint}/online/gaming/${boardId}/`);
  }

  public getChatId(boardId: string): Observable<string> {
    return this.httpClient.get<IChatID>(`${environment.endpoint}/online/gaming/${boardId}/chat/`)
      .pipe(
        map(i => i.chat_id),
      );
  }

  public getOnlineRatings(ratingMode?: RatingMode) {
    let params = new HttpParams();
    if (ratingMode) {
      params = params.set('rating_type', ratingMode);
    }
    return this.httpClient
      .get<IOnlineRating[]>(`${environment.endpoint}/online/grouped-rating/`, {params})
      .pipe(take(1))
      .subscribe((onlineRatings) => {
        this.store.dispatch(new SetOnlineRatings(onlineRatings));
      });
  }

  public getGamesHistory(limit?: number, offset?: number): Observable<IGameHistoryResponse> {
    let params = new HttpParams();

    if (limit) {
      params = params.set('limit', limit.toString());
    }
    if (offset) {
      params = params.set('offset', offset.toString());
    }

    return this.httpClient
      .get<IGameHistoryResponse>(`${environment.endpoint}/me/online/game-history/`, {params})
      .pipe(take(1));
  }

  public getPlayerQueue(): Observable<IPlayerInQueue[]> {
    return this.httpClient
      .get<IPlayerInQueue[]>(`${environment.endpoint}/online/request/queue/`)
      .pipe(
        take(1),
      );
  }

  public getOnlineTournaments(
    startTimeLeftBound?: string,
    startTimeRightBound?: string,
    onlyMyTournaments?: boolean,
    promoted?: boolean,
    limit?: number,
    sortDirection?: 'asc' | 'desc'
  ): Observable<IOnlineTournament[]> {
    return this.tournamentService.getOnlineTournaments(
      startTimeLeftBound,
      startTimeRightBound,
      onlyMyTournaments,
      promoted,
      limit,
      sortDirection
    );
  }

  public getOnlineTournamentsCount(
    startTimeLeftBound?: string,
    startTimeRightBound?: string,
    promoted?: boolean,
  ): Observable<number> {
    let params = new HttpParams();

    if (promoted) {
      params = params.set('promoted', promoted.toString());
    }

    if (startTimeLeftBound) {
      params = params.set('start_time_after', startTimeLeftBound);
    }

    if (startTimeRightBound) {
      params = params.set('start_time_before', startTimeRightBound);
    }
    params = params.set('limit', '1');
    params = params.set('ordering', 'datetime_of_tournament');

    return this.httpClient
      .get<IOnlineTournamentResponse>(`${environment.endpoint}/online/tournaments/`, {params})
      .pipe(
        take(1),
        map((response) => response.count)
      );
  }

  public getOnlineTournamentById(
    id: number,
  ): Observable<IOnlineTournament> {
    return this.httpClient
      .get<IOnlineTournament>(`${environment.endpoint}/online/tournaments/${id}/`, {}).pipe(
        catchError((error, caught) => {
          if ([404, 502].includes(error.status)) {
            return EMPTY;
          }

          return of(null);
        })
      );
  }

  getOnlineTournamentStandings(id: string): Observable<IOnlineTournamentStandings[]> {
    return this.httpClient
      .get<IOnlineTournamentStandings[]>(`${environment.endpoint}/online/tournaments/${id}/results/`)
      .pipe(
        take(1),
        catchError((error, caught) => {
          return of(null);
        })
      );
  }

  public getPGN(url: string): Observable<Blob> {
    if (url.indexOf('/api') === 0) {
      url = url.slice(4, url.length);
    }
    return this.httpClient.get(`${environment.endpoint}${url}`, {responseType: 'blob'});
  }

  public rejectOpponentRequest(uid: string, oppUid?: string): Observable<void> {
    let httpOptions = {};
    if (uid) {
      if (oppUid) {
        httpOptions = {
          body: {
            opp_uid: oppUid
          }
        };
      }
      return this.httpClient.delete<void>(`${environment.endpoint}/online/request/${uid}/`, httpOptions);
    } else {
      return of(null);
    }
  }

  public inviteCancelRequest(inviteCode: string, playerUID: string): Observable<any> {
    const params = {
      player_uid: playerUID,
      invite_code: inviteCode,
      opp_mode: OpponentMode.FRIEND
    };

    return this.httpClient
      .post<any>(`${environment.endpoint}/online/request/invite/cancel/`, params)
      .pipe(
        map((response) => ({...response})),
        catchError((err, caught) => {
          return this.getLocationErrorMsg(err.error.code).pipe(
            map((msg) => {
              return {
                errorCode: err.status,
                errorMsg: msg
              };
            }));
          }
        )
      );
  }

  public callToResign(boardId: IGameBoard['id']): void {
    this.sendSocketMessage({
      action: GameSocketActions.GAMING_GAMING_RESIGN,
      board_id: boardId,
    } as IGameResign);
  }

  public callToDraw(boardId: IGameBoard['id']): void {
    this.sendSocketMessage({
      action: GameSocketActions.GAMING_DRAW_OFFER,
      board_id: boardId,
    } as IGameDraw);
  }

  public cancelDrawOffer(boardId: IGameBoard['id']): void {
    this.sendSocketMessage({
      action: GameSocketActions.GAMING_CANCEL_DRAW_OFFER,
      board_id: boardId,
    } as IGameCancelDraw);
  }

  public subscribeToBoard(id: string, token?: string): void {
    this.sendSocketMessage({
      action: GameSocketActions.GAMING_SUBSCRIBE_TO_BOARD,
      message_type: SocketType.GAMING,
      board_id: id,
      token
    });
  }

  sendSocketMessage(message: IGameMessage) {
    if (message.action !== GameSocketActions.GAMING_PING) {
      this.store.dispatch(new SocketMessage(
        GameSocketMessagesHistoryDirections.OUTGOUING,
        message,
      ));
    }

    this.socket.sendMessage(message);
  }

  public sendBugReport(
    userUid: string,
    report: string,
    email: string,
    report_type: TypeOfBug,
    board: string,
    log: string
  ): Observable<void> {
    const user_uid = userUid || this.userUID;

    const params = {
      user_uid,
      board,
      report,
      log,
      report_type,
    };

    if (email) {
      params['email'] = email;
    }

    return this.httpClient.post<void>(`${environment.endpoint}/online/bugs/`, params);
  }

  public getTimerControls() {
    this.httpClient.get<ITimeControl[]>(`${environment.endpoint}/timecontrols/`)
      .subscribe((timeControls) => {
        this.store.dispatch(new SetTimeControls(timeControls));
        if (timeControls.length >= 3) {
          this.store.dispatch(new SetSelectedTimeControl(timeControls[2]));
        }
      });
  }

  public callAnArbiter(boardUID: string, playerUID: string): Observable<void> {
    return this.httpClient.post<void>(`${environment.endpoint}/online/gaming/${boardUID}/report/`, {
      abused_player_uid: playerUID
    });
  }

  public startPing(): void {

    const success$ = new BehaviorSubject<boolean>(true);

    this.pingIntervalSub = interval(GameResourceService.pingInterval).pipe(
      tap(() => {
        success$.next(false);
        this.sendSocketMessage({
          message_type: SocketType.GAMING,
          action: GameSocketActions.GAMING_PING,
        });
      }),
      mergeMap(() => this.socket.messages$.pipe(
        filter(msg => msg.action === GameSocketActions.GAMING_PONG),
        first(),
      )),
      mapTo(true),
    ).subscribe(success$);

    success$.pipe(
      bufferCount(3),
      filter(tries => !tries.find(t => !!t)),
    ).subscribe(() => {
      this.socket.socket.hardReconnect();
      this.stopPing();
      this.socket.whenReconnect().subscribe(() => {
        console.log('start ping again');
        this.startPing();
      });
    });

  }

  public stopPing(): void {
    if (this.pingIntervalSub) {
      this.pingIntervalSub.unsubscribe();
    }
  }

  public abortGame(board_id: string, user_uid: string): void {
    this.sendSocketMessage({
      message_type: SocketType.GAMING,
      action: GameSocketActions.GAMING_GAME_ABORT,
      board_id,
      user_uid,
    });
  }


  private getLocationErrorMsg(code: string): Observable<string> {
    return this.translateService.get(`BACKEND_MESSAGE.${code.toLocaleUpperCase()}`);
  }
}
