import { ISettingsGameAccount } from './../../../../account/account-store/account.model';
import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { GameState } from '@app/modules/game/state/game.state';
import { BehaviorSubject, combineLatest, merge, Observable, of, Subject } from 'rxjs';
import { IMove, IMovePosition } from '@app/broadcast/move/move.model';
import { IGameMove } from '@app/modules/game/state/game-move.model';
import { delay, distinctUntilChanged, filter, map, mergeMap, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import {
  AddNewMove,
  SetCapturedByBlack,
  SetCapturedByWhite,
  SetCheck,
  SetCheckmate,
  SetCheckmateReview,
  SetForce, SetGameSettings,
  SetPromotionPopupVisible, SetShowChat
} from '@app/modules/game/state/game.actions';
import { IChessEngineMove } from '@app/shared/widgets/chessground/chessground.component';
import { ChessColors } from '@app/modules/game/state/game-chess-colors.model';
import { CheckmateState } from '@app/shared/widgets/chessground/figure.model';
import { MatDialog } from '@angular/material';
import { GameSettingsWindowsComponent } from '@app/modal-windows/game-settings-windows/game-settings-windows.component';
import { INewMessage } from '@app/modules/game/state/game.model';
import { TournamentGameState } from '@app/modules/game/tournaments/states/tournament.game.state';

@Component({
  selector: 'game-chess-board',
  templateUrl: 'chess-board.component.html',
  styleUrls: ['chess-board.component.scss'],
})
export class GameChessBoardComponent implements AfterViewInit, OnDestroy, OnChanges {

  destroy$ = new Subject();
  redraw$ = new BehaviorSubject(false);

  @Input()
  countdownTimer = 0;
  @Input()
  isTournamentBoard = false;
  @Input()
  hideMenu = false;


  @Select(GameState.lastMove) lastMove$: Observable<IMove>;
  @Select(GameState.selectedMove) selectedMove$: Observable<IGameMove>;
  @Select(GameState.playerColor) playerColor$: Observable<ChessColors>;

  isReviewModeActive$: Observable<boolean> = this.selectedMove$.pipe(
    map((selectedMove) => !!selectedMove)
  );

  @Select(GameState.gameReady) ready$: Observable<boolean>;
  @Select(GameState.isMyMove) isPlayerMove$: Observable<boolean>;
  @Select(GameState.checkMateColor) checkmateColor$: Observable<ChessColors>;
  @Select(GameState.checkMateColorReview) checkmateColoReview$: Observable<ChessColors>;
  @Select(GameState.isBoardFlipped) boardIsFlipped$: Observable<boolean>;
  @Select(GameState.getGameSettings) gameSettings$: Observable<ISettingsGameAccount>;
  @Select(GameState.getShowChat) getShowChat$: Observable<boolean>;
  @Select(GameState.getNewMessage) getNewMessage$: Observable<INewMessage>;
  @Select(GameState.isResultShown) isResultShown$: Observable<boolean>;
  @Select(TournamentGameState.isLastTour) isLastTour$: Observable<boolean>;
  @Select(TournamentGameState.nextTourId) nextTourId$: Observable<string>;
  @Select(GameState.gameInProgress) gameInProgress$: Observable<boolean>;
  public _gameInProgress$: Observable<boolean> = this.gameInProgress$.pipe(
    tap((gip) => {
      if (!gip) {
      }
    }),
    switchMap((gip) => {
      if (gip) {
        return of(gip);
      } else {
        return of(gip).pipe(
          delay(5000)
        );
      }
    })
  );

  countdownTimer$ = new BehaviorSubject(0);

  public _gameReady$: Observable<boolean> = this.ready$.pipe(delay(50));

  boardOrientation$ = combineLatest([
    this.boardIsFlipped$,
    this.playerColor$
  ]).pipe(
    map(([boardIsFlipped, playerColor]) => {
      return boardIsFlipped
        ? (playerColor === ChessColors.Black
          ? ChessColors.White
          : ChessColors.Black)
        : playerColor;
    })
  );

  _checkMateColor$ = combineLatest([
    this.checkmateColor$,
    this.checkmateColoReview$,
    this.isReviewModeActive$
  ]).pipe(
    map(([ checkMateColor,
           checkMateColorReview,
           reviewModeActive
         ]) => reviewModeActive ? checkMateColorReview : checkMateColor)
  );

  ChessColors = ChessColors;

  // @ViewChild('boardwrapper', {read: ElementRef, static: false}) wrapper: ElementRef<HTMLElement>;
  @ViewChild('boardcontainer', {read: ElementRef, static: false}) container: ElementRef<HTMLElement>;

  _size$ = new BehaviorSubject(this.calcSize());
  size$ = this._size$.pipe(
    filter(v => !!v),
    delay(0),
    distinctUntilChanged(),
  );

  readOnly$ = combineLatest([
    this.ready$,
    this.isPlayerMove$,
    this.selectedMove$,
  ]).pipe(
    map(([ready, isMyMove, selected]) => {
      if (!ready) {
        return true;
      }
      return !isMyMove || selected;
    })
  );
  gameSettings: ISettingsGameAccount;

  constructor(
    private store: Store,
    private dialog: MatDialog,
  ) {
    this.ready$.pipe(
      takeUntil(this.destroy$),
      mergeMap(() => {
        return merge(
          of(true).pipe(delay(1000)),
          of(true).pipe(delay(2000))
        );
      }),
      tap(() => {
        this.redraw$.next(false);
      }),
    ).subscribe(() => {
      this.ngAfterViewInit();
      setTimeout(() => {
        this.redraw$.next(true);
      }, 10);
    });

    this.gameSettings$.pipe(
      takeUntil(this.destroy$)
    ).subscribe( (settings) => {
        this.gameSettings = settings;
    });
  }

  setCheck(isCheck: boolean) {
    this.store.dispatch(new SetCheck(isCheck));
  }

  setCheckmate(checkmateState: CheckmateState) {
    this.store.dispatch(new SetCheckmate(checkmateState));
  }

  setCheckmateReview(checkmateState: CheckmateState) {
    this.store.dispatch(new SetCheckmateReview(checkmateState));
  }

  promotionActivated(promotionActive: boolean) {
    this.store.dispatch(new SetPromotionPopupVisible(promotionActive));
  }

  move(position: IMovePosition) {
    const move: IGameMove = {
      created: new Date().toString(),
      ... position,
    };

    this.store.dispatch(new AddNewMove(move));
  }

  @HostListener('window:resize', ['$event'])
  ngAfterViewInit() {
    this._size$.next(this.calcSize());
  }

  calcSize() {
    if (!this.container) {
      return 0;
    }
    const containerHeight = this.container.nativeElement.offsetHeight;
    const containerWidth = this.container.nativeElement.offsetWidth;
    if (window.innerWidth > 999 && containerHeight > containerWidth) {
      if (containerWidth < (window.innerWidth - 480)) {
        return Math.min(
          window.innerWidth - 480, // лютейший хардкод, поскольку мы знаем ширину блоков слева и справа в сумме даёт 480
          containerHeight
        );
      }
      return containerHeight;
    }
    return Math.min(
      containerHeight,
      containerWidth,
    );
  }

  setForce(forces) {
    const { whiteForce, blackForce } = forces;
    this.store.dispatch(new SetForce(whiteForce, blackForce));
  }

  public onCaptureFigures(moves: IChessEngineMove[]): void {
    this.store.dispatch(new SetCapturedByBlack(moves
      .filter(move => move.color === 'b').map(move => move.captured)));
    this.store.dispatch(new SetCapturedByWhite(moves
      .filter(move => move.color === 'w').map(move => move.captured)));
  }

  settings() {
    const checkResults = function (source) {
      return (source['board_last_move_style']
        && source['board_style']
        && source['board_legal_move_style']) ? true : false;
    };
    return this.dialog.open(GameSettingsWindowsComponent, {
      panelClass: 'game-settings-player',
      disableClose: true,
      data: this.gameSettings
    }).afterClosed()
      .pipe(
        takeUntil(this.destroy$)
      ).subscribe((result) => {
        if (checkResults(result)) {
          this.store.dispatch(new SetGameSettings(
            result['board_style'],
            result['board_last_move_style'],
            result['board_legal_move_style'], result['is_sound_enabled']
          ));
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showChat() {
      this.getShowChat$.pipe(
        take(1)
      ).subscribe( (isShow) => {
          this.store.dispatch(new SetShowChat(!isShow));
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countdownTimer']) {
      this.countdownTimer$.next(changes['countdownTimer'].currentValue);
    }
  }
}
