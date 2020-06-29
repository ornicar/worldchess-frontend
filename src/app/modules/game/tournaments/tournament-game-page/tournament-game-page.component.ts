import { GameDataService } from './../../service/game-data.service';
import { OnlineTournamentService } from '@app/modules/game/tournaments/services/tournament.service';
import { ShowGameResult } from './../../state/game.actions';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, interval, merge, Observable, of, Subject } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { GameState, IForce, IGameState, OpponentMode, PlayerType } from '@app/modules/game/state/game.state';
import { CheckState, IGameMove } from '@app/modules/game/state/game-move.model';
import { GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import { IGameBoard } from '@app/modules/game/state/game-board.model';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { TFigure } from '@app/shared/widgets/chessground/figure.model';
import { EndReason, GameResult } from '@app/modules/game/state/game-result-enum';
import {
  catchError,
  defaultIfEmpty,
  delay,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
  first,
  debounceTime,
} from 'rxjs/operators';
import {
  CallAnArbiter,
  CancelDraw,
  DownloadPGN,
  Draw,
  FlipBoard,
  GetTimeControls,
  Resign,
  RestartGame,
  SetDefaultNewMessage,
  SetGameMenuVisible,
  SetNewMessage,
  SetPlayerColor,
  SetSelectedTimeControl,
  SetShowChat,
  TourBoardReady,
  SetOpponentMode,
  SetSelectedRatingMode,
  SetTimerInitializedInMoves,
} from '@app/modules/game/state/game.actions';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { ChessgroundAudioService } from '@app/shared/widgets/chessground/chessground.audio.service';
import { GameBadgeNotificationType, IGameBadgeNotification } from '@app/modules/game/game-page/game-page.component';
import { ChessColors } from '../../state/game-chess-colors.model';
import { IOnlineTournament, IOnlineTournamentStandings } from '@app/modules/game/tournaments/models/tournament.model';
import { TourResourceService } from '@app/broadcast/core/tour/tour-resource.service';
import * as moment from 'moment';
import { INewMessage } from '@app/modules/game/state/game.model';
import { GameService } from '@app/modules/game/state/game.service';
import * as fromAuth from '@app/auth/auth.reducer';
import { select, Store as NGRXStore } from '@ngrx/store';
import { selectToken } from '@app/auth/auth.reducer';
import { ChatSocketService } from '@app/broadcast/chess/chat/services/chat-socket.service';
import { IAccount } from '@app/account/account-store/account.model';
import {
  SetCurrentTourNumber,
  SetHasNoTourNotification,
  SetLastTourFlag,
  SetReadyToTourUpdate,
  SetTournamentInfo,
  SetTournamentOpponentInfo,
  SetTournamentPlayerInfo,
  SetTourStarted,
  TourReady,
} from '@app/modules/game/tournaments/states/tournament.actions';
import { TournamentState } from '@app/modules/game/tournaments/states/tournament.state';
import { OnlineTournamentResourceService } from '@app/modules/game/tournaments/providers/tournament.resource.service';
import { TournamentGameState } from '@app/modules/game/tournaments/states/tournament.game.state';
import { AccountService } from '@app/account/account-store/account.service';
import { TranslateService } from '@ngx-translate/core';

import { TournamentStatus } from '../../../../broadcast/core/tournament/tournament.model';

@Component({
  selector: 'wc-tournament-game-page',
  templateUrl: './tournament-game-page.component.html',
  styleUrls: ['./tournament-game-page.component.scss'],
})
export class TournamentGamePageComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  showResult$ = new BehaviorSubject(false);
  ChessColors = ChessColors;
  innerWidth = window.innerWidth;
  openedMenu = true;
  toggleChat = false;

  GameBadgeNotificationType = GameBadgeNotificationType;
  @Select(GameState.waitingOpponent) waitingOpponent$: Observable<boolean>;

  @Select(GameState.gameReady) gameReady$: Observable<boolean>;
  @Select(GameState.isResultShown) isResultShown$: Observable<boolean>;
  @Select(GameState.selectedMove) selectedMove$: Observable<IGameMove>;
  @Select(GameState.gameInProgress) gameInProgress$: Observable<boolean>;
  @Select(GameState.timeControls) timeControls$: Observable<ITimeControl[]>;
  @Select(GameState.selectedTimeControl) selectedTimeControl$: Observable<ITimeControl>;
  @Select(GameState.jwt) jwt$: Observable<string>;

  @Select(GameState.getChatId) getChatId$: Observable<string>;
  @Select(TournamentGameState.nextTourJWT) nextTourJWT$: Observable<string>;
  @Select(TournamentGameState.getCurrentActiveBoardId) currentActiveBoardId$: Observable<string>;
  @Select(TournamentGameState.nextTourBoardId) nextTourBoardId$: Observable<string>;
  @Select(TournamentGameState.nextTourId) nextTourId$: Observable<string>;
  @Select(TournamentGameState.getPlayerRank) playerRank$: Observable<number>;
  @Select(TournamentGameState.getPlayerScore) playerScore$: Observable<number>;
  @Select(TournamentGameState.getOpponentRank) opponentRank$: Observable<number>;
  @Select(TournamentGameState.getOpponentScore) opponentScore$: Observable<number>;
  @Select(TournamentGameState.tournamentId) tournamentId$: Observable<number>;
  @Select(TournamentGameState.nextTourBoardCreated) nextTourBoardCreated$: Observable<boolean>;
  @Select(TournamentGameState.readyToTourUpdate) readyToTourUpdate$: Observable<boolean>;
  @Select(TournamentGameState.isLastTour) isLastTour$: Observable<boolean>;
  @Select(TournamentGameState.tournamentName) tournamentName$: Observable<string>;
  @Select(TournamentGameState.tournamentCurrentTourNumber) tournamentCurrentTourNumber$: Observable<number>;
  @Select(TournamentGameState.getCurrentTourId) getCurrentTourId$: Observable<number>;
  @Select(TournamentGameState.isTourStarted) tourStarted$: Observable<boolean>;
  @Select(TournamentGameState.hasNoTour) hasNoTour$: Observable<boolean>;
  @Select(TournamentGameState.hasNoTourNotification) hasNoTourNotification$: Observable<boolean>;
  @Select(TournamentGameState.tournamentIsOver) tournamentIsOver$: Observable<boolean>;
  @Select(TournamentState.getTournament) tournament$: Observable<IOnlineTournament>;
  @Select(GameState.board) board$: Observable<IGameBoard>;
  @Select(GameState.error) error$: Observable<string>;
  @Select(GameState.playerColor) playerColor$: Observable<ChessColors>;

  @Select(GameState.isMyMove) isPlayerMove$: Observable<boolean>;
  @Select(GameState.isOpponentMove) isOpponentMove$: Observable<boolean>;

  @Select(GameState.player) player$: Observable<IPlayer>;
  @Select(GameState.playerTimer) playerTimer$: Observable<number>;

  @Select(GameState.capturedByPlayer) _capturedByPlayer$: Observable<TFigure[]>;
  @Select(GameState.capturedByOpponent) _capturedByOpponent$: Observable<TFigure[]>;

  @Select(GameState.gameResult) gameResult$: Observable<GameResult>;
  @Select(GameState.endReason) endReason$: Observable<EndReason>;

  @Select(GameState.opponent) opponent$: Observable<IPlayer>;
  @Select(GameState.opponentTimer) opponentTimer$: Observable<number>;

  @Select(GameState.getCheckState) isCheck$: Observable<CheckState>;
  @Select(GameState.isPlayerOfferedDraw) isPlayerOfferedDraw$: Observable<boolean>;
  @Select(GameState.isPlayerReadyToOfferDraw) isPlayerReadyToOfferDraw$: Observable<boolean>;
  @Select(GameState.opponentOfferedDraw) isOpponentOfferedDraw$: Observable<boolean>;
  @Select(GameState.isLetsPlayNotification) isLetsPlayNotification$: Observable<boolean>;
  @Select(GameState.isPlayerAnonymous) isPlayerAnonymous$: Observable<boolean>;
  @Select(GameState.force) force$: Observable<IForce>;
  @Select(GameState.canCallAnArbiter) canCallAnArbiter$: Observable<boolean>;
  @Select(GameState.gameRatingMode) gameRatingMode$: Observable<GameRatingMode>;
  @Select(GameState.opponentMode) opponentMode$: Observable<OpponentMode>;
  @Select(GameState.playerType) playerType$: Observable<PlayerType>;
  @Select(GameState.promotionPopupVisible) promotionPopupVisible$: Observable<boolean>;
  @Select(GameState.playerTimeLimitNotification) playerTimeLimitNotification$: Observable<boolean>;
  @Select(GameState.opponentTimeLimitNotification) opponentTimeLimitNotification$: Observable<boolean>;
  @Select(GameState.isBoardFlipped) boardIsFlipped$: Observable<boolean>;
  @Select(GameState.gameMenuVisible) gameMenuVisible$: Observable<boolean>;
  @Select(GameState.pgnUrl) pgnUrl$: Observable<string>;
  @Select(GameState.getUID) getUID$: Observable<string>;
  @Select(GameState.getReplayNotification) getReplayNotification$: Observable<string>;
  @Select(GameState.getIsReplay) getIsReplay$: Observable<boolean>;
  @Select(GameState.getRematchNotification) getRematchNotfication$: Observable<string>;
  @Select(GameState.getIsRematch) getIsRematch$: Observable<boolean>;
  @Select(GameState.getRematchInvite) getRematchInvite$: Observable<string>;
  @Select(GameState.getShowChat) getShowChat$: Observable<boolean>;
  @Select(GameState.account) account$: Observable<IAccount>;
  @Select(GameState.boardId) getBoardId$: Observable<string>;
  @Select(GameState.getLastChatId) getLastChatId$: Observable<string>;
  @Select(GameState.getNewMessage) getNewMessage$: Observable<INewMessage>;
  @Select(GameState.timerInitializedInMoves) timerInitializedInMoves$: Observable<boolean>;
  @Select(GameState.isSubscribedToBoard) boardSubscribed$: Observable<boolean>;
  @Select(GameState.connectionActive) connectionActive$: Observable<boolean>;
  @ViewChild('notificationsBodyResult', { static: false, read: ElementRef })
  notificationsBodyResult: ElementRef;

  public capturedByPlayer$: Observable<TFigure[]> = this._capturedByPlayer$.pipe(delay(100));
  public capturedByOpponent$: Observable<TFigure[]> = this._capturedByOpponent$.pipe(delay(100));
  public _gameReady$: Observable<boolean> = this.gameReady$.pipe(delay(50));
  public _gameInProgress$: Observable<boolean> = this.gameInProgress$.pipe(
    tap((gip) => {
      if (!gip) {
      }
    }),
    switchMap((gip) => {
      if (gip) {
        return of(gip);
      } else {
        return of(gip).pipe(delay(5000));
      }
    })
  );

  isMenuVisible$ = this.waitingOpponent$.pipe(
    withLatestFrom(this.opponentMode$),
    map(([waitingOpponent, opponentMode]) => {
      return waitingOpponent && (opponentMode === OpponentMode.HUMAN || opponentMode === OpponentMode.FRIEND);
    })
  );

  isAntiCheatPopupVisible$ = new BehaviorSubject(false);
  resultButtonsVisible$ = new BehaviorSubject(false);
  countdownTimer$ = new BehaviorSubject(0);

  gameReviewMode$ = this.selectedMove$.pipe(map((selectedMove) => !!selectedMove));

  public playerName$ = this.player$.pipe(
    withLatestFrom(this.isPlayerAnonymous$),
    map(([player, isPlayerAnonymous]) =>
      isPlayerAnonymous
        ? 'You'
        : player
        ? player.full_name
          ? player.full_name
          : player.nickname
          ? player.nickname
          : 'You'
        : 'You'
    )
  );

  public opponentName$ = this.opponent$.pipe(
    map((opponent) =>
      opponent
        ? opponent.full_name
          ? opponent.full_name
          : opponent.nickname
          ? opponent.nickname
          : 'Anonymous'
        : 'Anonymous'
    )
  );

  public topBadgeNotify: Observable<any> = combineLatest([
    this.isResultShown$,
    this.isCheck$,
    this.isPlayerOfferedDraw$,
    this.isPlayerReadyToOfferDraw$,
    this.isOpponentOfferedDraw$,
    this.isLetsPlayNotification$,
    this.selectedMove$,
  ]).pipe(
    withLatestFrom(this.endReason$, this.gameResult$, this.opponentName$),
    map(this.gameDataService.getTopBadgeNotify()),
    withLatestFrom(this.gameReviewMode$),
    mergeMap(([notify, gameReviewMode]) => {
      if (!notify) {
        return of(notify);
      }

      if (notify.notificationType === GameBadgeNotificationType.Action || this.innerWidth > 999 || gameReviewMode) {
        this.modalService.closeAll();
        return of(notify);
      } else {
        return merge(of(notify), of(null).pipe(delay(5000)));
      }
    })
  );

  public bottomBadgeNotify: Observable<IGameBadgeNotification> = combineLatest([
    this.isResultShown$,
    this.isCheck$,
    this.isOpponentOfferedDraw$,
  ]).pipe(
    withLatestFrom(this.endReason$, this.gameResult$),
    // TODO разобраться с ошибкой в консоли
    map(this.gameDataService.getBottomBadgeNotify()),
    mergeMap((notify: IGameBadgeNotification) => {
      if (!notify) {
        return of(notify);
      }

      if (notify.notificationType === GameBadgeNotificationType.AcceptDraw || this.innerWidth > 999) {
        return of(notify);
      } else {
        return merge(of(notify), of(null).pipe(delay(5000)));
      }
    })
  );

  playerMaterialAdvantage$: Observable<number> = this.force$.pipe(
    withLatestFrom(this.playerColor$),
    delay(100),
    map(([force, playerColor]) => {
      const { whiteForce, blackForce } = force;
      return playerColor === ChessColors.White ? whiteForce - blackForce : blackForce - whiteForce;
    })
  );

  opponentMaterialAdvantage$: Observable<number> = this.force$.pipe(
    withLatestFrom(this.playerColor$),
    delay(100),
    map(([force, playerColor]) => {
      const { whiteForce, blackForce } = force;
      return playerColor === ChessColors.White ? blackForce - whiteForce : whiteForce - blackForce;
    })
  );

  routeBoardId$ = this.route.params.pipe(
    takeUntil(this.destroy$),
    map((params) => (params && params['board_id'] ? params['board_id'] : null))
  );

  routeBoard$: Observable<IGameBoard> = this.routeBoardId$.pipe(
    takeUntil(this.destroy$),
    mergeMap((id) => {
      if (id) {
        return this.resource.getBoard(id).pipe(catchError(() => of(null)));
      } else {
        return of(null);
      }
    })
  );

  isAntiCheatCameraRecording$ = combineLatest([this.isPlayerMove$, this.isOpponentMove$]).pipe(
    map(() => {
      return true;
    }),
    mergeMap(() => {
      return merge(of(true), of(false).pipe(delay(500)));
    })
  );

  isCameraVisible$ = combineLatest([this.gameReady$, this.isAntiCheatPopupVisible$, this.gameRatingMode$]).pipe(
    map(([gameReady, antiCheatPopupVisible, gameRatingMode]) => {
      return gameReady && (antiCheatPopupVisible || gameRatingMode === GameRatingMode.FIDERATED);
    })
  );

  isCameraShadedVisible$ = combineLatest([
    this.gameReady$,
    this.isAntiCheatPopupVisible$,
    this.gameRatingMode$,
    this.opponentMode$,
  ]).pipe(
    map(([gameReady, antiCheatPopupVisible, gameRatingMode, opponentMode]) => {
      return (
        gameReady &&
        !antiCheatPopupVisible &&
        gameRatingMode !== GameRatingMode.FIDERATED &&
        opponentMode !== OpponentMode.BOT
      );
    })
  );

  public showMainNav = false;

  /**
   * The result of the player
   * @type {Subject<IOnlineTournamentStandings>}
   * @memberof TournamentGamePageComponent
   */
  public standing$: Observable<IOnlineTournamentStandings> = combineLatest([
    this.isResultShown$.pipe(filter((result) => !!result && result === true)),
    /**
     * get player UID
     */
    this.player$.pipe(
      filter((player) => !!player),
      map((player) => player.uid)
    ),
    /**
     * get tournament Id
     */
    this.tournamentId$.pipe(filter((tournamentId) => !!tournamentId)),
  ]).pipe(
    switchMap(([result, playerUID, tournamentID]) => {
      return of(true).pipe(
        switchMap((_) =>
          this.tournamentResource
            .getStandignResult(Number(tournamentID))
            .pipe(map((standings) => standings.find((standing) => standing.player_uid === playerUID)))
        )
      );
    }),
    takeUntil(this.destroy$)
  );

  private _gameState$: Subject<IGameState> = new Subject();

  _getChatID$ = combineLatest([this.getChatId$, this.getBoardId$, this.connectionActive$]).pipe(
    distinctUntilChanged(),
    switchMap(([chatID, boardId, isConnection]) => {
      if (chatID && boardId && isConnection) {
        console.log('chatID', chatID);
        return this.gameService.getChatID(boardId);
      }
      if (boardId && !chatID && isConnection) {
        console.log('chatID', chatID);
        return this.gameService.getChatID(boardId);
      } else {
        return of(null);
      }
    }),
    takeUntil(this.destroy$)
  );

  private token$ = this.authStore.pipe(select(selectToken));

  constructor(
    private store: Store,
    private modalService: ModalWindowsService,
    private route: ActivatedRoute,
    private router: Router,
    private resource: GameResourceService,
    private tournamentResource: OnlineTournamentResourceService,
    private tournamentService: OnlineTournamentService,
    private gameSharedService: GameSharedService,
    private audioService: ChessgroundAudioService,
    private authStore: NGRXStore<fromAuth.State>,
    private gameService: GameService,
    private tourService: TourResourceService,
    private chatService: ChatSocketService,
    private accountService: AccountService,
    private translateService: TranslateService,
    private gameDataService: GameDataService
  ) {
    this.gameService.initGameTimer();

    this.connectionActive$
      .pipe(debounceTime(200), withLatestFrom(this.boardSubscribed$, this.jwt$), takeUntil(this.destroy$))
      .subscribe(([active, boardSubscribed, jwt]) => {
        if (active) {
          if (boardSubscribed && jwt) {
            this.tournamentService.subscribeToTourBoard(jwt);
          } else {
            this.tournamentResource.updateTournamentStatus();
          }
        }
        if (!active && jwt) {
          this.modalService.alertConnect();
        }
      });

    this.currentActiveBoardId$
      .pipe(first(), withLatestFrom(this.tournamentId$))
      .subscribe(([currentActiveBoard, tournamentId]) => {
        if (!currentActiveBoard) {
          if (tournamentId) {
            this.router.navigate(['/tournament', tournamentId]);
          } else {
            this.router.navigate(['/']);
          }
        }
      });

    this.store.subscribe((s) => {
      this._gameState$.next(s['GameState'] as IGameState);
    });

    this.error$
      .pipe(
        takeUntil(this.destroy$),
        filter((v) => !!v)
      )
      .subscribe((e) => {
        this.store.dispatch(new RestartGame());
      });

    this.isResultShown$
      .pipe(withLatestFrom(this.playerType$, this.gameRatingMode$, this.isLastTour$), takeUntil(this.destroy$))
      .subscribe(([result, playerType, gameRatingMode, isLastTour]) => {
        if (result) {
          if (playerType !== PlayerType.Anonymous && gameRatingMode === GameRatingMode.UNRATED) {
            this.showResult$.next(false);
            this.resultButtonsVisible$.next(false);
            return;
          }
          this.resultButtonsVisible$.next(true);
          this.showResult$.next(true);
        } else {
          this.showResult$.next(false);
        }
      });

    this.gameInProgress$
      .pipe(
        delay(2000), // небольшая задержка, поскольку при мгновенной отправке бек отправляет 404
        withLatestFrom(this.canCallAnArbiter$, this.opponentMode$, this.selectedTimeControl$, this.gameRatingMode$),
        takeUntil(this.destroy$)
      )
      .subscribe(([gameInProgress, canCallAnArbitrer, opponentMode, selectedTimeControl, gameRatingMode]) => {
        if (gameInProgress && opponentMode === OpponentMode.HUMAN) {
          window['dataLayerPush'](
            'wchPlay',
            'Play',
            'Find opponent success',
            this.gameSharedService.convertBoardType(selectedTimeControl.board_type),
            this.gameSharedService.convertTime(selectedTimeControl),
            this.gameSharedService.convertGameMode(gameRatingMode)
          );
        }
        if (!gameInProgress && !canCallAnArbitrer) {
          this.store.dispatch(new CallAnArbiter());
        }
      });

    this.selectedMove$.pipe(takeUntil(this.destroy$)).subscribe((selectedMove) => {
      if (selectedMove && this.notificationsBodyResult) {
        this.notificationsBodyResult.nativeElement.scrollTo(0, 31 * (selectedMove.move_number - 1));
      }
    });

    this.gameMenuVisible$.pipe(takeUntil(this.destroy$)).subscribe((gameMenuVisible) => {
      this.openedMenu = gameMenuVisible;
    });

    this.store.dispatch(new SetPlayerColor(ChessColors.White));

    combineLatest([this.routeBoardId$, this.getCurrentTourId$, this.routeBoard$, this.nextTourBoardCreated$])
      .pipe(
        distinctUntilChanged(),
        withLatestFrom(
          this.nextTourBoardId$,
          this.tournamentId$,
          this.nextTourJWT$,
          this.timerInitializedInMoves$,
          this.readyToTourUpdate$,
          this.nextTourId$,
          this.boardSubscribed$,
          this.jwt$
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(
        ([
          some,
          nextTourBoardId,
          tournamentId,
          nextTourJWT,
          timerInitializedInMoves,
          readyToTourUpdate,
          nextTourId,
          boardSubscribed,
          jwt,
        ]) => {
          const [boardId, tourId, board, nextTourBoardCreated] = some;
          if (boardId && tourId && board && !boardSubscribed) {
            // Chat
            this.store.dispatch(new SetShowChat(false));
            this.store.dispatch(new SetDefaultNewMessage());
            this.toggleChat = false;

            if (!nextTourBoardCreated || !readyToTourUpdate) {
              if (!readyToTourUpdate && nextTourBoardCreated) {
                this.store.dispatch(new SetReadyToTourUpdate(true));
              }

              this.resource
                .getOnlineTournamentById(+tournamentId)
                .pipe(takeUntil(this.destroy$))
                .subscribe((tournament: IOnlineTournament) => {
                  this.store.dispatch(new SetTournamentInfo(tournament.title, tournament.number_of_tours));
                  this.store.dispatch(new SetSelectedRatingMode(tournament.rating_type));
                });

              this.tourService
                .getWithDefaults(tourId)
                .pipe(takeUntil(this.destroy$))
                .subscribe((tourWithDefaults) => {
                  if (!timerInitializedInMoves) {
                    this.store.dispatch(new SetSelectedTimeControl(tourWithDefaults.tour.time_control));
                  } else {
                    this.store.dispatch(new SetTimerInitializedInMoves(false));
                  }
                  this.store.dispatch(new SetLastTourFlag(tourWithDefaults.tour.is_last));
                  this.store.dispatch(new SetCurrentTourNumber(tourWithDefaults.tour.tour_number));
                  const timerLeft = moment(tourWithDefaults.tour.datetime_of_round).diff(moment(), 'seconds');
                  this.countdownTimer$.next(timerLeft);
                  if (timerLeft <= 0) {
                    this.store.dispatch(new SetTourStarted());
                  }
                });

              const tempBoard = {
                ...board,
              };

              if (!tempBoard.moves) {
                tempBoard.moves = [];
              }

              tempBoard.id = boardId;
              tempBoard.board_id = boardId;

              this.store.dispatch(new TourReady(tempBoard));
              this.store.dispatch(new TourBoardReady(tempBoard));
              this.store.dispatch(new SetOpponentMode(OpponentMode.HUMAN));

              combineLatest([
                this.tournamentResource.getOnlineTournamentStandings(tournamentId),
                this.player$.pipe(filter((player) => !!player)),
                this.opponent$.pipe(filter((opponent) => !!opponent)),
              ])
                .pipe(takeUntil(this.destroy$))
                .subscribe(([standings, player, opponent]) => {
                  standings.forEach((standing) => {
                    if (standing.player_uid === player.uid) {
                      this.store.dispatch(new SetTournamentPlayerInfo(standing.rank, standing.points));
                    }

                    if (standing.player_uid === opponent.uid) {
                      this.store.dispatch(new SetTournamentOpponentInfo(standing.rank, standing.points));
                    }
                  });
                });
            }
          }
          if (boardId && tourId && board && boardSubscribed) {
            this.tournamentService.subscribeToTourBoard(jwt);
          }
        }
      );

    this.tourStarted$
      .pipe(distinctUntilChanged(), withLatestFrom(this.jwt$), takeUntil(this.destroy$))
      .subscribe(([tourStarted, jwt]) => {
        if (tourStarted && !!jwt) {
          this.tournamentService.subscribeToTourBoard(jwt);
        }
      });

    combineLatest([this._getChatID$, this.token$, this.getLastChatId$])
      .pipe(distinctUntilChanged())
      .subscribe(([chatID, jwt, lastChatID]) => {
        if (lastChatID && jwt) {
          this.chatService.unsubscribeChat(lastChatID, jwt);
        }
        if (chatID && jwt) {
          this.chatService.subscribeChat(chatID, jwt);
        }
      });

    /**
     * Close all popus message
     */
    combineLatest([this._gameReady$, this.isResultShown$, this.boardSubscribed$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([gameReady, showResult, boardSubscribed]) => {
        if (!gameReady && !showResult && !boardSubscribed) {
          this.modalService.closeAll();
        }
      });

    combineLatest([
      this._getChatID$,
      this.getShowChat$.pipe(filter((i) => i === false)),
      this.account$.pipe(
        filter((i) => !!i),
        map((i) => i.id)
      ),
    ])
      .pipe(
        distinctUntilChanged(),
        switchMap(([chatID, isShow, accountID]) => {
          if (!isShow) {
            return this.chatService.messages$.pipe(
              map(({ comments }) => comments),
              filter((comments) => comments.length > 0),
              map((comments) => comments.filter((comment) => comment.chat === chatID && comment.user.id !== accountID)),
              defaultIfEmpty([])
            );
          } else {
            of([]);
          }
        })
      )
      .pipe(withLatestFrom(this.getNewMessage$))
      .subscribe(([comments, newMessage]) => {
        if (comments.length > 0) {
          if (newMessage.id !== comments[0].id) {
            this.store.dispatch(new SetNewMessage(comments[0].id, comments[0].user.id, true, false));
          }
        }
      });

    this.modalService.closeAll();

    this.hasNoTourNotification$
      .pipe(
        distinctUntilChanged(),
        filter((hasNoTour) => !!hasNoTour),
        delay(100),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        console.log('oops was shown');
        this.modalService.alert(
          '',
          "Oops, we don't have an opponent for you this round. But the good news is you won this tour!"
        );
        this.store.dispatch(new SetHasNoTourNotification(false));
      });

    this.boardSubscribed$
      .pipe(
        distinctUntilChanged(),
        filter((boardSubscribed) => !!boardSubscribed),
        delay(1000),
        withLatestFrom(this.gameInProgress$)
      )
      .subscribe(([_, gameInProgress]) => {
        if (!gameInProgress) {
          this.modalService.alertWithCountDown(
            '',
            'Your opponent has left the game. If he does not come back, you win the round.',
            550,
            moment().add(45, 's').toISOString()
          );
        }
      });

    this.gameInProgress$
      .pipe(
        distinctUntilChanged(),
        filter((gameInProgress) => !!gameInProgress)
      )
      .subscribe(() => {
        this.modalService.closeAll();
      });

    this.setLanguage();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = event.target.innerWidth;
  }

  sendStatistics(text) {
    this.tournament$.pipe(first()).subscribe((tournament) => {
      window['dataLayerPush'](
        'whcTournament',
        'Tournament',
        'Game',
        text,
        tournament.title,
        '',
        tournament.id,
        tournament.status === TournamentStatus.EXPECTED
          ? 'future'
          : tournament.status === TournamentStatus.GOES
          ? 'actual'
          : 'ended'
      );
    });
  }

  openAntiCheatPopup() {
    this.isAntiCheatPopupVisible$.next(true);
  }

  closeAntiCheatPopup() {
    this.isAntiCheatPopupVisible$.next(false);
  }

  // open/close menu
  openMenu() {
    this.openedMenu = !this.openedMenu;
    this.store.dispatch(new SetGameMenuVisible(this.openedMenu));
    this.modalService.closeAll();
  }

  sendReport() {
    this.store.dispatch(new CallAnArbiter());
  }

  showNotifications() {
    this.modalService.closeAll();
    this.showResult$.next(false);
    this.sendStatistics('Notation');
  }

  showResult() {
    this.modalService.closeAll();
    this.showResult$.next(true);
    this.sendStatistics('Result');
  }

  offerDraw() {
    this.store.dispatch(new Draw());
  }

  showChat() {
    this.toggleChat = !this.toggleChat;
    this.store.dispatch(new SetShowChat(this.toggleChat));
  }

  cancelDrawOffer() {
    this.modalService.closeAll();
    this.store.dispatch(new CancelDraw());
  }

  resign() {
    this.modalService.closeAll();
    this.store.dispatch(new Resign());
  }

  flipBack() {
    this.modalService.closeAll();
    this.store.dispatch(new FlipBoard(false));
  }

  ngOnInit() {
    this.store.dispatch(new GetTimeControls());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.gameService.destroyGameTimer$.next();
  }

  public downloadPGN(): void {
    this.modalService.closeAll();
    this.store.dispatch(new DownloadPGN());
  }

  prepareAudioElement() {
    this.audioService.prepareAudioElement();
  }

  private setLanguage() {
    this.accountService
      .getLanguage()
      .pipe(
        filter((lang) => !!lang),
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        this.translateService.use(data);
      });
  }
}
