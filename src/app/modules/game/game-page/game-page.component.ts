import { GameDataService } from './../service/game-data.service';
import { MatDialog } from '@angular/material/dialog';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { GameState, IForce, IGameState, OpponentMode, PlayerType } from '../state/game.state';
import { BehaviorSubject, combineLatest, merge, Observable, of, Subject } from 'rxjs';
import {
  AddGameBoard,
  CallAnArbiter,
  CancelDraw,
  Draw,
  FlipBoard,
  GameBoardCreated,
  GetTimeControls,
  Resign,
  RestartGame,
  SubscribeToBoard,
  DownloadPGN,
  SetInviteCode,
  SetNotification,
  SetSelectedTimeControl,
  SetCancelInvite,
  SetSelectedRatingMode,
  SetShowChat,
  SetNewMessage,
  RejectOpponentRequest,
} from '../state/game.actions';
import {
  catchError,
  delay,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  takeUntil,
  withLatestFrom,
  distinct,
  take,
  switchMap,
  defaultIfEmpty,
  throttleTime,
  tap,
  debounceTime,
} from 'rxjs/operators';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import { ActivatedRoute, Router } from '@angular/router';
import { IGameBoard } from '../state/game-board.model';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { ChessColors } from '@app/modules/game/state/game-chess-colors.model';
import { TFigure } from '@app/shared/widgets/chessground/figure.model';
import { EndReason, GameResult } from '@app/modules/game/state/game-result-enum';
import { CheckState, IGameMove } from '@app/modules/game/state/game-move.model';
import { SetGameMenuVisible } from '@app/modules/game/state/game.actions';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { EOppMode } from '@app/modules/game/state/online-request-response.model';
import { ChessgroundAudioService } from '@app/shared/widgets/chessground/chessground.audio.service';
import { GameService } from '@app/modules/game/state/game.service';
import * as fromAuth from '../../../auth/auth.reducer';
import { select, Store as NGRXStore } from '@ngrx/store';
import { selectToken } from '../../../auth/auth.reducer';
import { ChatSocketService } from '@app/broadcast/chess/chat/services/chat-socket.service';
import { IAccount } from '@app/account/account-store/account.model';
import { INewMessage } from '@app/modules/game/state/game.model';
import { TournamentGameState } from '@app/modules/game/tournaments/states/tournament.game.state';
import { AccountService } from '@app/account/account-store/account.service';
import { TranslateService } from '@ngx-translate/core';

interface IUrlParams {
  board_id: string;
}

export enum GameBadgeNotificationType {
  Message,
  Info,
  Action,
  AcceptDraw,
  OfferedDraw,
  ReadyToOfferDraw,
}

export interface IGameBadgeNotification {
  notificationType?: GameBadgeNotificationType;
  notification?: string;
}

@Component({
  selector: 'game-page',
  templateUrl: 'game-page.component.html',
  styleUrls: ['game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();
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
  @Select(GameState.boardId) boardId$: Observable<string>;
  @Select(GameState.jwt) jwt$: Observable<string>;
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
  @Select(GameState.getLastChatId) getLastChatId$: Observable<string>;
  @Select(GameState.getNewMessage) getNewMessage$: Observable<INewMessage>;
  // @Select(GameState.connectionActive) connectionActive$: Observable<boolean>;
  @Select((state: { GameState: { connectionActive: boolean } }) => state.GameState.connectionActive) connectionActive$: Observable<boolean>;
  @Select(TournamentGameState.tourBoardId) tourBoardId$: Observable<string>;

  @ViewChild('notificationsBodyResult', { static: false, read: ElementRef })
  notificationsBodyResult: ElementRef;

  public capturedByPlayer$: Observable<TFigure[]> = this._capturedByPlayer$.pipe(delay(100));
  public capturedByOpponent$: Observable<TFigure[]> = this._capturedByOpponent$.pipe(delay(100));
  public _gameReady$: Observable<boolean> = this.gameReady$.pipe(
    delay(50),
    withLatestFrom(this.boardId$, this.tourBoardId$),
    map(([gameReady, boardId, tourBoardId]) => {
      if (boardId !== tourBoardId) {
        return gameReady;
      }

      return false;
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

  gameReviewMode$ = this.selectedMove$.pipe(map((selectedMove) => !!selectedMove));

  public playerName$ = this.player$.pipe(
    withLatestFrom(this.isPlayerAnonymous$),
    map(([player, isPlayerAnonymous]) =>
      isPlayerAnonymous ? 'You' : player ? (player.full_name ? player.full_name : player.nickname ? player.nickname : 'You') : 'You'
    )
  );

  public opponentName$ = this.opponent$.pipe(
    map((opponent) =>
      opponent ? (opponent.full_name ? opponent.full_name : opponent.nickname ? opponent.nickname : 'Anonymous') : 'Anonymous'
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

  routeInviteId$ = this.route.params.pipe(
    takeUntil(this.destroy$),
    map((params) => (params && params['invite_code'] ? params['invite_code'] : null))
  );

  routeOppMode$ = this.route.params.pipe(
    takeUntil(this.destroy$),
    map((params) => (params && params['opp_mode'] ? params['opp_mode'] : null))
  );

  routeInvite$: Observable<any> = combineLatest([
    this.routeInviteId$.pipe(filter((invite) => !!invite)),
    this.getUID$.pipe(
      filter((uid) => !!uid),
      distinct()
    ),
    this.routeOppMode$,
  ]).pipe(
    takeUntil(this.destroy$),
    mergeMap(([invite, uid, oppMode]) => {
      if (invite) {
        return this.resource.requestInvite(invite, uid, oppMode ? oppMode : EOppMode.FRIEND).pipe(catchError(() => of(null)));
      } else {
        return of(null);
      }
    })
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

  isCameraShadedVisible$ = combineLatest([this.gameReady$, this.isAntiCheatPopupVisible$, this.gameRatingMode$, this.opponentMode$]).pipe(
    map(([gameReady, antiCheatPopupVisible, gameRatingMode, opponentMode]) => {
      return gameReady && !antiCheatPopupVisible && gameRatingMode !== GameRatingMode.FIDERATED && opponentMode !== OpponentMode.BOT;
    })
  );

  public showMainNav = false; // TODO дикий костыль ваще
  private _gameState$: Subject<IGameState> = new Subject();
  private token$ = this.authStore.pipe(select(selectToken));

  getChatID$ = combineLatest([this.boardId$, this._gameReady$]).pipe(
    distinctUntilChanged(),
    switchMap(([boardId, ready]) => {
      if (ready && boardId) {
        return this.gameService.getChatID(boardId);
      } else {
        return of(null);
      }
    })
  );

  constructor(
    private store: Store,
    private modalService: ModalWindowsService,
    private route: ActivatedRoute,
    private router: Router,
    private resource: GameResourceService,
    private gameSharedService: GameSharedService,
    private dialog: MatDialog,
    private audioService: ChessgroundAudioService,
    private gameService: GameService,
    private authStore: NGRXStore<fromAuth.State>,
    private chatService: ChatSocketService,
    private accountService: AccountService,
    private translateService: TranslateService,
    private gameDataService: GameDataService
  ) {
    this.connectionActive$
      .pipe(debounceTime(200), withLatestFrom(this.boardId$, this.gameInProgress$, this.jwt$), takeUntil(this.destroy$))
      .subscribe(([active, boardId, gip, jwt]) => {
        if (active) {
          // TODO  надо закрывать конкретный алерт про энтэрнеты
          this.modalService.closeAll();
        }
        if (active && boardId && gip && jwt) {
          this.resource.subscribeToBoard(boardId, jwt);
        }
        if (!active && boardId && jwt) {
          this.modalService.alertConnect();
        }
      });

    this.gameService.initGameTimer();

    this.store.subscribe((s) => {
      this._gameState$.next(s['GameState'] as IGameState);
    });
    const state$ = this._gameState$.pipe(
      distinctUntilChanged((s1: IGameState, s2: IGameState) => {
        return s1.jwt === s2.jwt && s1.boardId === s2.boardId;
      })
    );
    let state = this.store.snapshot()['GameState'];
    let routerBoard = null;
    let routerBoardId = null;

    this.error$
      .pipe(
        takeUntil(this.destroy$),
        filter((v) => !!v)
        // tap(alert),
      )
      .subscribe((e) => {
        this.store.dispatch(new RestartGame());
      });

    this.boardId$
      .pipe(takeUntil(this.destroy$), withLatestFrom(this.routeBoardId$, this.tourBoardId$))
      .subscribe(([boardId, routeBoardId, tourBoardId]) => {
        if (!routerBoardId && boardId && boardId !== routeBoardId && boardId !== tourBoardId) {
          this.router.navigate([`/singlegames/${boardId}`]).then();
        } else if (routerBoardId && !boardId && !state.board) {
          this.router.navigate(['/singlegames/']).then();
        }
      });

    const tick$ = new Subject();

    this.routeBoard$.pipe(takeUntil(this.destroy$), withLatestFrom(this.tourBoardId$)).subscribe(([board, tourBoardId]) => {
      const id = routerBoardId;
      const { boardId, jwt } = state;
      if (!jwt && !!id) {
        this.router.navigate(['/singlegames']).then();
      } else if (boardId && jwt && !id && boardId !== tourBoardId) {
        this.router.navigate([`/singlegames/${boardId}`]).then();
      } else if (!boardId && !id && !!jwt) {
        this.store.dispatch(new RestartGame());
      } else if (boardId && !id) {
      } else if (!!jwt && !boardId && !!id && !!board) {
        this.store.dispatch(new GameBoardCreated(board.board_id, jwt, board.white_player.uid));
        this.store.dispatch(new AddGameBoard(board));
        this.store.dispatch(new SubscribeToBoard(jwt));
      } else if (!!boardId && !!id && !!jwt && !!board) {
        this.store.dispatch(new AddGameBoard(board));
        this.store.dispatch(new SubscribeToBoard(jwt));
      } else if (!!id && jwt && !board && !boardId) {
        this.router.navigate(['/singlegames']).then();
      } else {
      }
    });

    state$.subscribe((_state) => {
      state = _state;
      tick$.next();
    });

    this.routeBoardId$.subscribe((_routeBoardId) => {
      routerBoardId = _routeBoardId;
      // tick$.next();
    });
    this.routeBoard$.subscribe((_routerBoard) => {
      routerBoard = _routerBoard;
      tick$.next();
    });

    this.isResultShown$
      .pipe(
        filter((v) => !!v),
        withLatestFrom(this.playerType$, this.gameRatingMode$),
        takeUntil(this.destroy$)
      )
      .subscribe(([result, playerType, gameRatingMode]) => {
        if (playerType !== PlayerType.Anonymous && gameRatingMode === GameRatingMode.UNRATED) {
          this.showResult$.next(false);
          this.resultButtonsVisible$.next(false);
          return;
        }
        this.resultButtonsVisible$.next(true);
        this.showResult$.next(true);
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

    this.routeInvite$.subscribe((data) => {
      this.store.dispatch(new SetCancelInvite(true));
      if (data['errorCode']) {
        this.store.dispatch(new SetNotification(`${data['errorMsg']}`));
        this.store.dispatch(new SetCancelInvite(false));
        this.router.navigate(['/singlegames']).then();
      } else {
        this.translateService.get(`MESSAGES.WELCOME_TO_GAME`).subscribe((msg) => {
          this.store.dispatch(new SetNotification(msg));
        });
        this.store.dispatch(new SetSelectedTimeControl(data['time_control'][0]));
        this.store.dispatch(new SetSelectedRatingMode(data['rating'][0]));
        this.store.dispatch(new SetInviteCode(data['opp_mode'], data['invite_code'], data['uid']));
      }
    });

    combineLatest([this.getChatID$, this.token$, this._gameReady$, this.getLastChatId$])
      .pipe(distinctUntilChanged())
      .subscribe(([chatID, jwt, ready, lastChatID]) => {
        if (!ready && lastChatID && jwt) {
          this.chatService.unsubscribeChat(lastChatID, jwt);
        }
        if (ready && chatID && jwt) {
          this.chatService.subscribeChat(chatID, jwt);
        }
      });

    combineLatest([
      this.getChatID$,
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
    this.setLanguage();
  }

  cancelReplayGame() {
    this.gameService.cancelRematch();
  }

  replayGame() {
    this.gameService.rematch();
  }

  isReplay() {
    return this.gameService.isEnd();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = event.target.innerWidth;
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
  }

  sendReport() {
    this.store.dispatch(new CallAnArbiter());
  }

  showNotifications() {
    this.showResult$.next(false);
  }

  showResult() {
    this.showResult$.next(true);
  }

  offerDraw() {
    this.store.dispatch(new Draw());
  }

  showChat() {
    this.toggleChat = !this.toggleChat;
    this.store.dispatch(new SetShowChat(this.toggleChat));
  }

  cancelDrawOffer() {
    this.store.dispatch(new CancelDraw());
  }

  resign() {
    this.store.dispatch(new Resign());
  }

  flipBack() {
    this.store.dispatch(new FlipBoard(false));
  }

  ngOnInit() {
    this.store.dispatch(new GetTimeControls());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.gameService.destroyGameTimer$.next();
    this.boardId$.pipe(withLatestFrom(this.waitingOpponent$), take(1)).subscribe(([boardId, waitingOpponent]) => {
      if (waitingOpponent && !boardId) {
        this.store.dispatch(new RejectOpponentRequest());
      }
    });
  }

  public downloadPGN(): void {
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
