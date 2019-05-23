import {ChangeDetectionStrategy, Component, Input, NgZone, OnChanges, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {createSelector, select, Store} from '@ngrx/store';
import {BehaviorSubject, fromEvent, Observable, of} from 'rxjs';
import {
  combineLatest,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  map,
  shareReplay,
  switchMap,
  take,
  throttleTime
} from 'rxjs/operators';
import {OnChangesInputObservable, OnChangesObservable} from '../../../../../shared/decorators/observable-input';
import {MousetrapHelper} from '../../../../../shared/helpers/mousetrap.helper';
import {SubscriptionHelper, Subscriptions} from '../../../../../shared/helpers/subscription.helper';
import {BoardStatus, IBoard} from '../../../../core/board/board.model';
import {selectBoard} from '../../../../core/board/board.reducer';
import {SetSelectedMove} from '../../../../move/move.actions';
import * as fromMove from '../../../../move/move.reducer';

@Component({
  selector: 'wc-chess-navigation',
  templateUrl: './chess-navigation.component.html',
  styleUrls: ['./chess-navigation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessNavigationComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  myGameIsActive = false;

  @Input()
  boardId?: IBoard['id'] = null;

  @OnChangesInputObservable()
  boardId$ = new BehaviorSubject<IBoard['id']>(this.boardId);

  private selectBoard = selectBoard();
  private selectSelectedMoveId = fromMove.selectSelectedMoveId();
  private selectBoardMovesIds = fromMove.selectBoardMovesIds();

  private selectNavigation = createSelector(
    this.selectSelectedMoveId,
    this.selectBoardMovesIds,
    (id, ids) => ({
        ids,
        index: id ? ids.indexOf(id) : -1,
      })
  );

  board$: Observable<IBoard> = this.boardId$.pipe(
    switchMap(boardId => boardId
      ? this.store$.pipe(select(this.selectBoard, {boardId}))
      : of(null)
    ),
    shareReplay(1)
  );

  isNotExpected$: Observable<boolean> = this.board$.pipe(
    map(board => board && board.status !== BoardStatus.EXPECTED),
    shareReplay(1)
  );

  navigationData$ = this.boardId$.pipe(
    switchMap(boardId => this.store$.pipe(
      select(this.selectNavigation, { boardId })
    ))
  );

  navigation$ = this.isNotExpected$.pipe(
    switchMap(isNotExpected => isNotExpected
      ? this.navigationData$
      : of({ ids: [], index: -1 })
    )
  );

  isDisableBegin$ = this.navigation$.pipe(
    map(navigation => {
      return !navigation.ids.length || navigation.index === 0;
    }),
    distinctUntilChanged()
  );

  isDisableEnd$ = this.navigation$.pipe(
    map(navigation => {
      return !navigation.ids.length || navigation.index === navigation.ids.length - 1;
    }),
    distinctUntilChanged()
  );

  isPredictPosition$ = this.store$.pipe(
    select(fromMove.selectedPredictPosition),
    map(pos => Boolean(pos)),
    distinctUntilChanged()
  );

  subs: Subscriptions = {};

  constructor(private store$: Store<fromMove.State>, private ngZone: NgZone) { }

  ngOnInit() {
    this.subs.onLeft = fromEvent(MousetrapHelper.eventTargetLike(this.ngZone), 'left')
      .pipe(
        throttleTime(100),
        combineLatest(
          this.isDisableBegin$,
          this.isPredictPosition$,
          (event, isDisable, isPredictPosition) => ({ event, isDisable, isPredictPosition })
        ),
        distinctUntilKeyChanged('event'),
        // @TODO add a type!!!
        filter(({ isDisable, isPredictPosition }: any) => !isDisable && !isPredictPosition)
      )
      .subscribe(() => this.onBackwardClick());

    this.subs.onRight = fromEvent(MousetrapHelper.eventTargetLike(this.ngZone), 'right')
      .pipe(
        throttleTime(100),
        combineLatest(
          this.isDisableEnd$,
          this.isPredictPosition$,
          (event, isDisable, isPredictPosition) => ({ event, isDisable, isPredictPosition })
        ),
        distinctUntilKeyChanged('event'),
        // @TODO add a type!!!
        filter(({ isDisable, isPredictPosition }: any) => !isDisable && !isPredictPosition)
      )
      .subscribe(() => this.onForwardClick());
  }

  @OnChangesObservable()
  ngOnChanges() {
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  onBeginClick(): void {
    this.navigation$.pipe(take(1)).subscribe(({ ids }) =>
      this.store$.dispatch(new SetSelectedMove({ id: ids[0] }))
    );
  }

  onBackwardClick(): void {
    this.navigation$.pipe(take(1)).subscribe(({ ids, index }) =>
      this.store$.dispatch(new SetSelectedMove({ id: ids[index - 1] }))
    );
  }

  onForwardClick(): void {
    this.navigation$.pipe(take(1)).subscribe(({ ids, index }) =>
      this.store$.dispatch(new SetSelectedMove({ id: ids[index + 1] }))
    );
  }

  onEndClick(): void {
    this.navigation$.pipe(take(1)).subscribe(({ ids }) =>
      this.store$.dispatch(new SetSelectedMove({ id: ids[ids.length - 1] }))
    );
  }

}
