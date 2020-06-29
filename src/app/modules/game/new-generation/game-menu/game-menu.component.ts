import { TranslateService } from '@ngx-translate/core';
import { Component, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { select, Store as NgrxStore } from '@ngrx/store';
import { BehaviorSubject, combineLatest, interval, Observable, of, Subject, pipe } from 'rxjs';
import { GameState, OpponentMode } from '@app/modules/game/state/game.state';
import {
  FlipBoard,
  RestartGame,
  SendBugReport,
  SetBugReportModalOpened,
  SetGameMenuVisible,
  SetGameSettings,
} from '@app/modules/game/state/game.actions';
import { debounceTime, map, mergeMap, take, takeUntil, takeWhile, tap, delay, first } from 'rxjs/operators';
import { GameScreenService } from '@app/modules/game/state/game.screen.service';
import { BugReportWindowComponent } from '@app/modal-windows/bug-report-window/bug-report-window.component';
import { MatDialog } from '@angular/material';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import { GameSettingsWindowsComponent } from '@app/modal-windows/game-settings-windows/game-settings-windows.component';
import { ISettingsGameAccount } from '@app/account/account-store/account.model';
import * as  fromRoot from '@app/reducers';
import { selectIsAuthorized } from '@app/auth/auth.reducer';
import { GameService } from '@app/modules/game/state/game.service';
import { INewMessage } from '@app/modules/game/state/game.model';
import { TournamentGameState } from '@app/modules/game/tournaments/states/tournament.game.state';
import { IGameMove } from '@app/modules/game/state/game-move.model';
import { AccountService } from '@app/account/account-store/account.service';
import { TournamentState } from '@app/modules/game/tournaments/states/tournament.state';
import { IOnlineTournament } from '@app/modules/game/tournaments/models/tournament.model';
import { TournamentStatus } from '@app/broadcast/core/tournament/tournament.model';
@Component({
  selector: 'game-menu',
  templateUrl: 'game-menu.component.html',
  styleUrls: ['game-menu.component.scss'],
})
export class GameMenuComponent implements OnDestroy {

  openmenu = false;

  @Input()
  isTournamentMenu = false;

  @Select(GameState.gameInProgress) gameInProgress$: Observable<boolean>;
  @Select(GameState.isPlayerOfferedDraw) playerOfferedDraw$: Observable<boolean>;
  @Select(GameState.isPlayerReadyToOfferDraw) playerReadyToOfferDraw$: Observable<boolean>;
  @Select(GameState.gameMenuVisible) gameMenuVisible$: Observable<boolean>;
  @Select(GameState.selectedMove) selectedMove$: Observable<IGameMove>;
  @Select(GameState.isBoardFlipped) boardIsFlipped$: Observable<boolean>;
  @Select(GameState.selectedTimeControl) selectedTimeControl$: Observable<ITimeControl>;
  @Select(GameState.gameRatingMode) gameRatingMode$: Observable<GameRatingMode>;
  @Select(GameState.getGameSettings) gameSettings$: Observable<ISettingsGameAccount>;
  @Select(GameState.opponentMode) gameOpponentMode$: Observable<OpponentMode>;
  @Select(GameState.gameReady) gameReady$: Observable<boolean>;
  @Select(GameState.getIsReplay) gamegetIsReplay$: Observable<boolean>;
  @Select(GameState.getRematchNotification) getRematchNotfication$: Observable<string>;
  @Select(GameState.getIsRematch) getIsRematch$: Observable<boolean>;
  @Select(GameState.getRematchInvite) getRematchInvite$: Observable<string>;
  @Select(GameState.waitingOpponent) waitingOpponent$: Observable<boolean>;
  @Select(GameState.getShowChat) getShowChat$: Observable<boolean>;
  @Select(GameState.getNewMessage) getNewMessage$: Observable<INewMessage>;
  @Select(GameState.getOpponentUID) getOpponentUID$: Observable<string>;
  @Select(TournamentGameState.tournamentId) tournamentId$: Observable<number>;
  @Select(TournamentGameState.tournamentName) tournamentName$: Observable<string>;
  @Select(TournamentGameState.tournamentNumberOfTours) tournamentNumberOfTours$: Observable<number>;
  @Select(TournamentGameState.tournamentCurrentTourNumber) tournamentCurrentTourNumber$: Observable<number>;
  @Select(TournamentState.getTournament) tournament$: Observable<IOnlineTournament>;
  @Output() offerDraw = new EventEmitter<void>();
  @Output() cancelDraw = new EventEmitter<void>();
  @Output() resign = new EventEmitter<void>();
  @Output() toggleChat = new EventEmitter<void>();

  isMobile$ = new BehaviorSubject(false);

  playerOfferedDraw = false;
  resign$ = new BehaviorSubject(false);
  resignProgress$ = this.resign$.pipe(
    mergeMap((resign) => {
      if (resign && this.gameInProgress) {
        return interval(25).pipe(
          take(101),
          takeWhile(() => this.resign$.value),
          tap((t) => {
            if (t === 100) {
              this.debouncer.next();
              this.openmenu = false;
            }
          }),
        );
      } else {
        return of(0);
      }
    }),
  );

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized)
  );

  boardIsFlipped = false;
  reviewMode = false;
  isMobile = false;
  gameInProgress = true;
  bugReportModalOpened = false;
  gameRatingMode: GameRatingMode;
  selectedTimeControl: ITimeControl;
  gameSettings: ISettingsGameAccount;
  opponentMode: OpponentMode;
  private  _rematchInvite: string;
  private _gameEnd: boolean;
  private _showChat: boolean;

  debouncer = new Subject();
  destroy$ = new Subject();

  constructor(
    private store: Store,
    private store$: NgrxStore<fromRoot.State>,
    private gameScreenService: GameScreenService,
    private dialog: MatDialog,
    private modalService: ModalWindowsService,
    private gameSharedService: GameSharedService,
    private translateService: TranslateService,
    private gameService: GameService,
    public accountService: AccountService
  ) {
    this.debouncer.pipe(
      debounceTime(100),
      takeUntil(this.destroy$)
    ).subscribe(() => this.resign.emit());

    this.gameMenuVisible$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((menuVisible) => {
      this.openmenu = menuVisible;
    });

    this.gameScreenService.isMobile$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(this.isMobile$);

    this.isMobile$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((isMobile) => this.isMobile = isMobile);

    this.selectedMove$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((selectedMove) => this.reviewMode = !!selectedMove);

    this.boardIsFlipped$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((boardIsFlipped) => {
      this.boardIsFlipped = boardIsFlipped;
    });

    this.selectedTimeControl$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((selectedTimeControl) => {
      this.selectedTimeControl = selectedTimeControl;
    });

    this.gameRatingMode$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((gameRatingMode) => {
      this.gameRatingMode = gameRatingMode;
    });

    this.gameInProgress$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((gameInProgress) => {
      this.gameInProgress = gameInProgress;
    });

    this.gameSettings$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((settings) => {
      this.gameSettings = settings;
    });

    this.getShowChat$.pipe(
      delay(50)
    ).subscribe((isShow) => {
      this._showChat = isShow;
    });
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
        tournament.status === TournamentStatus.EXPECTED ? 'future' : tournament.status === TournamentStatus.GOES ? 'actual' : 'ended'
      );
    });
  }

  openBugReportDialog() {
    this.bugReportModalOpened = true;
    this.store.dispatch(new SetGameMenuVisible(false));
    this.store.dispatch(new SetBugReportModalOpened(true));

    this.sendStatistics('Report a bug');

    this.modalService.closeAll();

    return this.dialog.open(BugReportWindowComponent, {
      disableClose: true,
    })
    .afterClosed(
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe((result) => {
      if (result) {
        this.store.dispatch(new SendBugReport(result.report, result.type, result.email));
        combineLatest([
          this.translateService.get(`MESSAGES.BUG_REPORT`),
          this.translateService.get(`MESSAGES.BUG_MESSAGE`),
        ]).pipe(
          take(1)
        ).subscribe(([bug, msg]) => {
          this.modalService.alert(bug, msg);
        });
        this.bugReportModalOpened = false;
        this.store.dispatch(new SetBugReportModalOpened(false));
      }
    });
  }

  playAgain() {
    if (!this.isTournamentMenu) {
      this.modalService.closeAll();
      this.store.dispatch(new RestartGame());

      this.sendStatistics('New game');
    }
  }

  flipBoard() {
    if (!(this.isMobile && this.reviewMode) && this.gameInProgress) {
      this.modalService.closeAll();
      this.store.dispatch(new FlipBoard(true));
      if (this.isMobile) {
        this.closeMenu();
      }

      this.sendStatistics('Flip board');
    }
  }
  cancelRematch() {
    this.gameService.cancelRematch();
  }


  settings() {
    const checkResults = function (source) {
       return (source['board_last_move_style']
       && source['board_style']
       && source['board_legal_move_style']) ? true : false;
    };

    this.sendStatistics('Settings');

    return this.dialog.open(GameSettingsWindowsComponent, {
      panelClass: 'game-settings-player',
      disableClose: true,
      data: this.gameSettings
    }).afterClosed()
    .pipe(
      takeUntil(this.destroy$)
    ).subscribe( (result) => {
      this.modalService.closeAll();
      if (checkResults(result)) {
        this.store.dispatch(new SetGameSettings(
          result['board_style'],
          result['board_last_move_style'],
          result['board_legal_move_style'], result['is_sound_enabled']
        ));
      }
    });

  }

  flipBack() {
    if (!(this.isMobile && this.reviewMode)) {
      this.modalService.closeAll();
      this.store.dispatch(new FlipBoard(false));
      if (this.isMobile) {
        this.closeMenu();
      }
    }
  }

  showChat() {
    this.toggleChat.emit();
    this.modalService.closeAll();
    this.closeMenu();

    this.sendStatistics('Chat');
  }

  closeMenu() {
    this.openmenu = false;
    this.store.dispatch(new SetGameMenuVisible(this.openmenu));
  }

  isReplay() {
    return this.gameService.isEnd();
  }

  replayGame() {
    this.gameService.rematch();
    this.sendStatistics('Replay game');
  }

  @HostListener('document:keypress', ['$event'])
  keypress(event: KeyboardEvent) {
    if (!this.bugReportModalOpened && !this._showChat) {
      if (event.key === 'd') {
        this.callForDraw();
      }
      if (event.key === 'f') {
        if (this.boardIsFlipped) {
          this.flipBack();
        } else {
          this.flipBoard();
        }
      }
    }
  }

  callForDraw() {
    if (!this.playerOfferedDraw && this.gameInProgress) {
      this.modalService.closeAll();
      this.offerDraw.emit();
      this.closeMenu();
    }
  }

  cancelDrawOffer() {
    if (this.gameInProgress) {
      this.modalService.closeAll();
      this.cancelDraw.emit();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
