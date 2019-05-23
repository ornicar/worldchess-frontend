import {ChangeDetectionStrategy, Component, HostBinding, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Color} from 'chessground/types';
import {BehaviorSubject, combineLatest, EMPTY, Observable, of} from 'rxjs';
import { distinctUntilChanged, filter, map, mergeMap, shareReplay, switchMap } from 'rxjs/operators';
import {OnChangesInputObservable, OnChangesObservable} from '../../../../../../shared/decorators/observable-input';
import {SubscriptionHelper, Subscriptions} from '../../../../../../shared/helpers/subscription.helper';
import {IBoard} from '../../../../../core/board/board.model';
import * as fromBoard from '../../../../../core/board/board.reducer';
import {BoardTypeTimeBlack, BoardTypeTimeWhite, ITour, ITimeControl} from '../../../../../core/tour/tour.model';
import {selectTour} from '../../../../../core/tour/tour.reducer';
import {IMove} from '../../../../../move/move.model';
import {selectBoardLastMove, selectBoardPlayerLastMove} from '../../../../../move/move.reducer';
import * as moment from 'moment';

@Component({
  selector: 'wc-move-timer',
  templateUrl: './move-timer.component.html',
  styleUrls: ['./move-timer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoveTimerComponent implements OnInit, OnDestroy, OnChanges {

  @Input()
  isMinimalViewMode = false;

  @Input()
  playerColor: Color;

  @OnChangesInputObservable()
  playerColor$ = new BehaviorSubject<Color>(this.playerColor);

  @HostBinding('class.white-player')
  get isWhitePlayer() {
    return this.playerColor === 'white';
  }

  isWhitePlayer$ = this.playerColor$.pipe(
    filter(color => Boolean(color)),
    distinctUntilChanged(),
    map(color => color === 'white')
  );

  @Input()
  board: IBoard;

  @OnChangesInputObservable()
  private board$ = new BehaviorSubject<IBoard>(this.board);

  private selectTour = selectTour();
  private selectBoardLastMove = selectBoardLastMove();
  private selectBoardPlayerLastMove = selectBoardPlayerLastMove();

  public isShowTimer$: Observable<boolean>;

  private tour$: Observable<ITour> = this.board$.pipe(
    switchMap(board => board
      ? this.store$.pipe(select(this.selectTour, { tourId: board.tour }))
      : null
    )
  );

  public lastMove$: Observable<IMove | null> = this.board$
    .pipe(
      switchMap((board) => board
        ? this.store$.pipe(select(this.selectBoardLastMove, { boardId: board.id }))
        : null
      ),
      shareReplay(1)
    );

  public playerLastMove$: Observable<IMove | null> = combineLatest(this.board$, this.isWhitePlayer$)
    .pipe(
      switchMap(([board, playerColorIsWhite]) => board
        ? this.store$.pipe(select(this.selectBoardPlayerLastMove, { boardId: board.id, playerColorIsWhite }))
        : null
      ),
      shareReplay(1)
    );

  // seconds left for current player.
  public playerLastMoveSecondsLeft$: Observable<number> = this.playerLastMove$
    .pipe(
      switchMap((move) => move
        ? of(move.seconds_left)
        : combineLatest(this.tour$.pipe(filter(tour => Boolean(tour))), this.isWhitePlayer$).pipe(
          switchMap(([tour, isWhitePlayer]) => tour.time_control
            ? this.getStartTimeForPlayer(tour.time_control, isWhitePlayer)
            : isWhitePlayer ? of(BoardTypeTimeWhite[tour.board_type]) : of(BoardTypeTimeBlack[tour.board_type])
          )
        )
      ),
      shareReplay(1)
    );

  // start time of move.
  playerMoveStartTimeMs$ = this.lastMove$.pipe(
    filter(move => Boolean(move) && move.is_white_move === !this.isWhitePlayer),
    map(move => {
      const created = new Date(move.created);
      const now = new Date();
      // When start time is in future then the timer will show from current time.
      return now.getTime() - created.getTime() > 0 ? created.getTime() : now.getTime();
    }),
    distinctUntilChanged(),
    shareReplay(1)
  );

  public timers$ = combineLatest(this.playerMoveStartTimeMs$, this.playerLastMoveSecondsLeft$).pipe(
    map(([startTime, secondsLeft]) => {
      const startTimeDate = new Date(startTime);
      const secondsLeftDate = moment().add(secondsLeft, 's').toDate();

      // Sync timers
      startTimeDate.setMilliseconds(0);
      secondsLeftDate.setMilliseconds(0);

      return {
        startTimeDate: startTimeDate.toISOString(),
        secondsLeftDate: secondsLeftDate.toISOString()
      };
    })
  );

  public showTimers$: Observable<any>;

  subs: Subscriptions = {};

  constructor(
    private store$: Store<fromBoard.State>,
  ) {
  }

  ngOnInit() {
    this.isShowTimer$ = this.isShowTimerForCurrentSide();
    this.showTimers$ = this.isShowTimer$.pipe(mergeMap((isShow) => {
      return isShow ? this.timers$ : EMPTY;
    }));
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  private getStartTimeForPlayer(timeControl: ITimeControl, isWhitePlayer: boolean): Observable<number> {
    const startTime = !isWhitePlayer && timeControl.black_start_time ? timeControl.black_start_time : timeControl.start_time;
    return of(moment(startTime, 'HH:mm:ss').diff(moment().startOf('day'), 'seconds'));
  }

  private isShowTimerForCurrentSide(): Observable<boolean> {
    return combineLatest(this.lastMove$, this.playerLastMove$).pipe(
      map(([lastMove, playerLastMove]) =>
        lastMove ? (lastMove !== playerLastMove) : this.isWhitePlayer
      )
    );
  }


  @OnChangesObservable()
  ngOnChanges(): void {
  }
}
