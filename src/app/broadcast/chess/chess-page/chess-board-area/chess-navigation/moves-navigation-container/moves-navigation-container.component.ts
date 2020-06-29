import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap, throttleTime } from 'rxjs/operators';
import { OnChangesInputObservable, OnChangesObservable } from '../../../../../../shared/decorators/observable-input';
import { SubscriptionHelper, Subscriptions } from '../../../../../../shared/helpers/subscription.helper';
import { BoardStatus, IBoard } from '../../../../../core/board/board.model';
import { SetSelectedMove } from '../../../../../move/move.actions';
import { IMove } from '../../../../../move/move.model';
import * as fromMove from '../../../../../move/move.reducer';
import { DeactivateVariationMoves } from '../../../../../variation-move/variation-move.actions';
import { selectVariationMovesIsActive } from '../../../../../variation-move/variation-move.reducer';

@Component({
  selector: 'wc-moves-navigation-container',
  templateUrl: './moves-navigation-container.component.html',
  styleUrls: ['./moves-navigation-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovesNavigationContainerComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  board: IBoard;

  @OnChangesInputObservable()
  board$ = new BehaviorSubject<IBoard>(this.board);

  variationMovesIsActive$ = this.store$.pipe(
    select(selectVariationMovesIsActive)
  );

  sliderWidth: number;

  readonly maxSliderWidth = 200;
  readonly valueForFixedSlider = 80;

  private selectBoardMoves = fromMove.selectBoardMoves();
  private selectSelectedMove = fromMove.selectSelectedMove();

  isNotExpected$: Observable<boolean> = this.board$.pipe(
    map(board => board && board.status !== BoardStatus.EXPECTED),
    shareReplay(1)
  );

  selectSelectedMove$ = this.board$.pipe(
    switchMap(board => board && board.status !== BoardStatus.EXPECTED
      ? this.store$
        .pipe(
          select(this.selectSelectedMove, { boardId: board.id })
        )
      : of(null)
    ),
    shareReplay(1)
  );

  moves$ = this.board$.pipe(
    switchMap(board => board && board.status !== BoardStatus.EXPECTED
      ? this.store$.pipe(
          select(this.selectBoardMoves, { boardId: board.id })
        )
      : of([])
    ),
    // @todo fix. ExpressionChangedAfterItHasBeenCheckedError
    throttleTime(10, undefined, { leading: true, trailing: true }),
    shareReplay(1)
  );

  scores$ = this.moves$.pipe(
    map(moves => moves.map(move => move.stockfish_score || 0)),
    // @todo fix. ExpressionChangedAfterItHasBeenCheckedError
    throttleTime(10, undefined, { leading: true, trailing: true }),
  );

  get isLive() {
    return this.board && this.board.status === BoardStatus.GOES;
  }

  private subs: Subscriptions = {};

  constructor(
    private store$: Store<fromMove.State>
  ) {
  }

  ngOnInit() {
    this.subs.moves = this.moves$
      .pipe(
        map(moves => moves.length),
        distinctUntilChanged()
      )
      .subscribe(max => this.updateSliderWidth(max));
  }

  @OnChangesObservable()
  ngOnChanges() {
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  updateSliderWidth(max): void {
    let width = this.maxSliderWidth;

    if (max < this.valueForFixedSlider) {
      width = Math.round(this.maxSliderWidth / this.valueForFixedSlider * max);
    }

    this.sliderWidth = Math.min(this.maxSliderWidth, width);
  }

  sliderChanged(move: IMove) {
    this.store$.dispatch(new SetSelectedMove({ id: move.id }));
  }

  deactivateVariationMoves($event) {
    $event.preventDefault();

    this.store$.dispatch(new DeactivateVariationMoves());
  }
}
