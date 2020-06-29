import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener, Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { GameState } from '@app/modules/game/state/game.state';
import { BehaviorSubject, interval, Observable, of, Subject } from 'rxjs';
import { IGameMove } from '@app/modules/game/state/game-move.model';
import {
  debounceTime,
  defaultIfEmpty,
  delay,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  take,
  takeUntil,
  takeWhile,
  tap,
  throttleTime,
  withLatestFrom,
  first
} from 'rxjs/operators';
import {
  AbortGame,
  DownloadPGN, RejectOpponentRequest,
  SelectMove,
  SetCancelInvite,
  SetGameMenuVisible,
  SetReplayNotification
} from '@app/modules/game/state/game.actions';
import { ChessColors } from '@app/modules/game/state/game-chess-colors.model';
import { GameResult } from '@app/modules/game/state/game-result-enum';
import { GameScreenService } from '@app/modules/game/state/game.screen.service';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { TournamentGameState } from '@app/modules/game/tournaments/states/tournament.game.state';
import { TournamentState } from '@app/modules/game/tournaments/states/tournament.state';
import { IOnlineTournament } from '@app/modules/game/tournaments/models/tournament.model';
import { TournamentStatus } from '@app/broadcast/core/tournament/tournament.model';

const iconClasses = {
  'Q': 'Q',
  'P': 'P',
  'B': 'B',
  'R': 'R',
  'K': 'K',
  'N': 'N',
  'O': 'K' // For Castling.
};

const figureSet = new Set(['Q', 'B', 'R', 'K', 'N']);

interface INotationMove {
  fen: string;
  san: string;
  move_number: number;
  is_white_move: boolean;
  created: string;
  time_spent?: string;
  time_left?: string;
  seconds_left?: number;
  seconds_spent?: number;
  firstFigure?: string;
  lastFigure?: string;
  isCheck?: boolean;
  lastChar?: string;
}

@Component({
  selector: 'game-notifications',
  templateUrl: 'notifications.component.html',
  styleUrls: ['notifications.component.scss']
})
export class GameNotificationsComponent implements OnDestroy, AfterViewInit {

  @Input()
  isTournamentBoard = false;

  @Output()
  offerDraw = new EventEmitter<void>();
  @Output()
  cancelDraw = new EventEmitter<void>();
  @Output()
  resign = new EventEmitter<void>();

  @Select(GameState.moves) _moves$: Observable<IGameMove[]>;
  @Select(GameState.gameInProgress) gameInProgress$: Observable<boolean>;
  @Select(GameState.gameResult) gameResult$: Observable<GameResult>;
  @Select(GameState.playerColor) playerColor$: Observable<ChessColors>;
  isWhite$ = this.playerColor$.pipe(map(color => color === ChessColors.White));
  @Select(GameState.isPlayerOfferedDraw) playerOfferedDraw$: Observable<boolean>;
  @Select(GameState.isPlayerReadyToOfferDraw) playerReadyToOfferDraw$: Observable<boolean>;
  @Select(GameState.gameMenuVisible) gameMenuVisible$: Observable<boolean>;
  @Select(GameState.selectedMove) selectedMove$: Observable<IGameMove>;
  @Select(GameState.isBoardFlipped) boardIsFlipped$: Observable<boolean>;
  @Select(GameState.isBugReportModalOpened) bugReportModalIsOpened$: Observable<boolean>;
  @Select(GameState.isResultShown) isResultShown$: Observable<boolean>;
  @Select(GameState.gameReady) gameReady$: Observable<boolean>;
  @Select(GameState.getShowChat) getShowChat$: Observable<boolean>;
  @Select(TournamentGameState.tournamentId) tournamentId$: Observable<number>;
  @Select(TournamentGameState.tournamentName) tournamentName$: Observable<string>;
  @Select(TournamentState.getTournament) tournament$: Observable<IOnlineTournament>;
  cancelGameAvailable$ = this._moves$.pipe(
    defaultIfEmpty([]),
    map((moves) => (!moves || moves && moves.length < 2))
  );

  private _showChat: boolean;

  destroy$ = new Subject();
  playerOfferedDraw = false;
  openedMenu = false;
  resign$ = new BehaviorSubject(false);
  resignProgress$ = this.resign$.pipe(
    mergeMap((resign) => {
      if (resign) {
        return interval(25).pipe(
          take(101),
          takeWhile(() => this.resign$.value),
          tap((t) => {
            if (t === 100) {
              this.debouncer.next();
            }
          }),
        );
      } else {
        return of(0);
      }
    }),
  );

  isMobile$ = new BehaviorSubject(false);

  curMoveNumber = 0;
  isWhiteTurn = true;

  @ViewChild('notificationsbody', {static: false, read: ElementRef}) notificationsBody: ElementRef;
  @ViewChildren('moves') moveViews: QueryList<ElementRef>;

  lines$: Observable<Array<[INotationMove, INotationMove]>> = this._moves$.pipe(
    filter(v => !!v),
    distinctUntilChanged(),
    map((moves) => {
      const obj = moves.reduce((acc, move) => {
        if (!acc[move.move_number]) {
          acc[move.move_number] = {white: null, black: null};
        }

        if (move.is_white_move) {
          acc[move.move_number].white = this.prepareMove(move);
        } else {
          acc[move.move_number].black = this.prepareMove(move);
        }

        return acc;

      }, {});

      return Object.keys(obj).sort((a, b) => +a - +b).map(k => {
        return [obj[k].white, obj[k].black];
      }) as Array<[INotationMove, INotationMove]>;

    }),
    map((lines) => lines && lines.length ? lines : null),
    throttleTime(50),
  );

  linesAccumulator$: BehaviorSubject<Array<[INotationMove, INotationMove]>> = new BehaviorSubject([]);
  linesAccumulatorWithTap$ = this.linesAccumulator$.pipe(
    tap(() => {
      setTimeout(this.scroll.bind(this), 0);
    }),
    filter(i => i.length > 0),
    defaultIfEmpty(null)
  );

  debouncer = new Subject();

  boardIsFlipped = false;
  isMobile = false;
  bugReportModalIsOpened = false;

  constructor(
    private store$: Store,
    private gameScreenService: GameScreenService,
    private gameResourceService: GameResourceService
  ) {

    // this.lines$.pipe(
    //   takeUntil(this.destroy$)
    // ).subscribe( (lines) => {
    //   console.log('lines->', lines);
    // });

    // this.linesAccumulator$.pipe(
    //   takeUntil(this.destroy$)
    // ).subscribe( (linesAcc) => {
    //   console.log('linesAccum->', linesAcc);
    // });

    this.playerOfferedDraw$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((flag) => {
      this.playerOfferedDraw = flag;
    });

    this.gameResult$.pipe(
      takeUntil(this.destroy$),
      delay(500),
    ).subscribe(() => {
      this.scroll();
    });

    this.debouncer
      .pipe(debounceTime(100))
      .subscribe(() => this.resign.emit());

    this.gameMenuVisible$.pipe(takeUntil(this.destroy$))
      .subscribe((menuVisible) => {
        this.openedMenu = menuVisible;
      });

    this.selectedMove$.pipe(
      takeUntil(this.destroy$),
    ).subscribe((selectedMove) => {
      if (selectedMove && this.notificationsBody) {
        this.notificationsBody.nativeElement.scrollTo(
          0,
          31 * (selectedMove.move_number - 1),
        );
      }
    });

    this.gameScreenService.isMobile$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(this.isMobile$);

    this.isMobile$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((isMobile) => this.isMobile = isMobile);

    this.boardIsFlipped$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((boardIsFlipped) => {
      this.boardIsFlipped = boardIsFlipped;
    });

    this.bugReportModalIsOpened$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((bugReportModalIsOpened) => {
      this.bugReportModalIsOpened = bugReportModalIsOpened;
    });

    this.lines$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((lines) => {
      if (lines) {
        const lastLine = lines.length ? lines[lines.length - 1] : null;
        const lastIndex = lastLine[1] ? 1 : 0;
        if (lastLine[0].move_number - this.curMoveNumber < 2) {
          if (lastLine[lastIndex].move_number > this.curMoveNumber || lastLine[lastIndex].is_white_move === this.isWhiteTurn) {
            this.curMoveNumber = lastLine[lastIndex].move_number;
            this.isWhiteTurn = !this.isWhiteTurn;
            if (!lastIndex) {
              this.linesAccumulator$.value.push(lastLine);
              this.linesAccumulator$.next(this.linesAccumulator$.value);
            } else {
              this.linesAccumulator$.value.pop();
              this.linesAccumulator$.value.push(lastLine);
              this.linesAccumulator$.next(this.linesAccumulator$.value);
            }
          }
        } else {
          this.curMoveNumber = lastLine[lastIndex].move_number;
          this.isWhiteTurn = !(lastLine[lastIndex].is_white_move);
          this.linesAccumulator$.next(lines);
        }
      }
    });

    this.getShowChat$.pipe(
      delay(50)
    ).subscribe( (isShow) => {
      this._showChat = isShow;
    });
  }

  figure(move: IGameMove): string {
    if (move.san[0] === '0') {
      return '';
    }
    const s = iconClasses[move.san[0]] || iconClasses['P'];
    return (move.is_white_move ? 'w' : 'b') + s;
  }

  prepareMove(move: IGameMove): INotationMove {
    if (move.san.indexOf('O') > -1) {
      return {
        ...move,
        san: move.san.split('O').join('0')
      };
    } else {
      const resultMove: INotationMove = {
        ...move,
        lastChar: '',
        isCheck: false
      };
      if (figureSet.has(resultMove.san[0])) {
        resultMove.firstFigure = (move.is_white_move ? 'w' : 'b') + resultMove.san[0];
        resultMove.san = resultMove.san.slice(1);
      } else {
        resultMove.firstFigure = (move.is_white_move ? 'w' : 'b') + 'P';
      }
      const indexOfPromotion = resultMove.san.indexOf('=');
      if (indexOfPromotion > -1) {
        resultMove.lastFigure = (move.is_white_move ? 'w' : 'b') + resultMove.san[indexOfPromotion + 1];
        if (resultMove.san.length > indexOfPromotion + 2) {
          resultMove.lastChar = resultMove.san[resultMove.san.length - 1];
          resultMove.isCheck = true;
        }
        resultMove.san = resultMove.san.slice(0, indexOfPromotion);

        if (resultMove.san.indexOf('x') > -1) {
          resultMove.san = resultMove.san.slice(resultMove.san.indexOf('x') + 1);
        }
      }
      if (resultMove.san[resultMove.san.length - 1] === '+'
        || resultMove.san[resultMove.san.length - 1] === '#') {
        resultMove.lastChar = resultMove.san[resultMove.san.length - 1];
        resultMove.san = resultMove.san.slice(0, resultMove.san.length - 1);
        resultMove.isCheck = true;
      }
      return resultMove;
    }
  }

  scroll() {
    if (this.notificationsBody) {
      this.notificationsBody.nativeElement.scrollTo(
        0,
        1000000,
      );
    }
  }

  @HostListener('document:keypress', ['$event'])
  keypress(event: KeyboardEvent) {
    if (!this.bugReportModalIsOpened && !this._showChat) {
      if (event.key === 'd') {
        this.callForDraw();
      }
    }
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
    })
  }

  _resign(value, $event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();
    this.resign$.next(value);

    this.sendStatistics('Resign')
  }

  callForDraw() {
    if (!this.playerOfferedDraw) {
      this.offerDraw.emit();
    }

    this.sendStatistics('Offer a draw')
  }

  cancelDrawOffer() {
    this.cancelDraw.emit();
  }

  selectMove(move: IGameMove) {
    if (!(this.isMobile && this.boardIsFlipped)) {
      this.store$.dispatch(new SelectMove(move));
    }

    this.sendStatistics('game steps')
  }

  openMenu() {
    this.openedMenu = !this.openedMenu;
    this.store$.dispatch(new SetGameMenuVisible(this.openedMenu));
  }

  cancelGame() {
    this.store$.dispatch(new AbortGame());
  }

  ngAfterViewInit() {
    setTimeout(() => this.scroll(), 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
