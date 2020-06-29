import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit } from '@angular/core';
import { createSelector, select, Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, pairwise, switchMap, take } from 'rxjs/operators';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { Subscriptions } from '@app/shared/helpers/subscription.helper';
import { BoardStatus, IBoard } from '../../../core/board/board.model';
import { SetSelectedLastMove, SetSelectedMove } from '../../../move/move.actions';
import { IMove } from '../../../move/move.model';
import * as fromMove from '../../../move/move.reducer';
import { IVariationMove } from '../../../variation-move/variation-move.model';
import {
  selectGroupedVariationMovesOfBoard, selectSelectedVariationMoveOfBoard, selectVariationMovesIsActive
} from '../../../variation-move/variation-move.reducer';

@Component({
  selector: 'wc-history-moves',
  templateUrl: './history-moves.component.html',
  styleUrls: ['./history-moves.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('smoothShowing', [
      transition(':enter', [
        style({opacity: 0}),
        animate('260ms ease-in', style({opacity: 1}))
      ]),
      transition(':leave', [
        animate('280ms ease-in-out', style({opacity: 0}))
      ])
    ])
  ]
})
export class HistoryMovesComponent implements OnInit, OnChanges {

  @Input()
  canChangeSelectedMove = true;

  @Input()
  myGameIsActive = false;

  @Input() hideMoveNumbers = false;

  @Input() board: IBoard;

  @OnChangesInputObservable()
  private board$ = new BehaviorSubject<IBoard>(this.board);

  private boardId$ = this.board$.pipe(
    map(board => board.id),
  );

  private selectGroupedMoves = fromMove.selectBoardGroupedMoves();
  private selectGroupedVariationMoves = selectGroupedVariationMovesOfBoard();
  private selectSelectedVariationMoveOfBoard = selectSelectedVariationMoveOfBoard();

  private selectBoardMovesAndSelectedMove = createSelector(
    fromMove.selectBoardMoves(),
    fromMove.selectSelectedMove(),
    (moves, move): [IMove[], IMove] => [moves, move]
  );

  private selectSelectedMove = fromMove.selectSelectedMove();

  private movesInsideScrollArea = new Set<IMove>();

  public selectedVariationMove: IVariationMove;

  public selectedMove: IMove;
  public newMoves = new Set<IMove>();

  private selectedMove$ = this.boardId$.pipe(
    switchMap(boardId =>
      this.store$.pipe(select(this.selectSelectedMove, {boardId}))
    )
  );

  groupedMoves$ = this.boardId$.pipe(
    distinctUntilChanged(),
    switchMap(boardId => boardId
      ? this.store$.pipe(
        select(this.selectGroupedMoves, {boardId})
      )
      : of([])
    ),
    debounceTime(10), // @todo fix. ExpressionChangedAfterItHasBeenCheckedError
  );

  // When  game is complete the last move should has specific color.
  completedMoveId$ = this.groupedMoves$.pipe(
    map(groupedMoves => {
      if (groupedMoves.length) {
        const [white, black] = groupedMoves[groupedMoves.length - 1];

        return black ? black.id : white.id;
      } else {
        return null;
      }
    })
  );

  showPlaceholdersLine$ = this.groupedMoves$.pipe(
    map(groupedMoves => {
      // add a line with placeholders when moves is loading.
      // or add a line with placeholders when a last move is black.
      return !groupedMoves.length || groupedMoves[groupedMoves.length - 1][1];
    })
  );

  variationMoves$ = this.boardId$.pipe(
    distinctUntilChanged(),
    switchMap(boardId => boardId
      ? this.store$.pipe(
        select(this.selectGroupedVariationMoves, {boardId})
      )
      : of({})
    ),
    debounceTime(10),
  );

  selectedVariationMoves$ = combineLatest([
    this.selectedMove$,
    this.variationMoves$
  ]).pipe(map(([selectedMove, variationMoves]) => {
    if (selectedMove && variationMoves) {
      return variationMoves[selectedMove.id];
    } else {
      return null;
    }
  }));

  boardStatus = BoardStatus;

  private subs: Subscriptions = {};

  constructor(
    private store$: Store<fromMove.State>,
    private cd: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.initDetectNewMoves();
  }

  @OnChangesObservable()
  ngOnChanges() {
  }

  private initDetectNewMoves() {
    this.subs.selectedVariationMove = this.boardId$
      .pipe(
        switchMap(boardId =>
          this.store$.pipe(select(this.selectSelectedVariationMoveOfBoard, {boardId}))
        ),
      )
      .subscribe((selectedVariationMove: IVariationMove) => {
        this.selectedVariationMove = selectedVariationMove;
        this.cd.markForCheck();
      });

    this.subs.selectedMove = this.selectedMove$
      .subscribe(selectedMove => {
        this.selectedMove = selectedMove;
        this.cd.markForCheck();
      });

    this.subs.newMoves = this.boardId$
      .pipe(
        distinctUntilChanged(),
        switchMap(boardId => combineLatest(
          of(boardId),
          this.store$.pipe(select(this.selectBoardMovesAndSelectedMove, {boardId}))
        )),
        pairwise()
      )
      .subscribe(([[prevBoardId, [prevMoves]], [nextBoardId, [nextMoves, selectedMove]]]) => {
        const selectedMoveIsLast = nextMoves.indexOf(selectedMove) === (nextMoves.length - 1);
        const lastVisibleMove = this.getLastMoveInsideScrollArea();

        // Only when received new moves on the current board.
        if (!selectedMoveIsLast && lastVisibleMove && prevBoardId === nextBoardId) {
          let newMoves = [];

          // Get new moves.
          for (let i = 0; i < nextMoves.length; i++) {
            // All moves should be sorted.
            if (nextMoves[i] !== prevMoves[i]) {
              newMoves = nextMoves.splice(i);
            }
          }

          // Remove moves which user saw.
          newMoves = newMoves.slice(
            1 + Math.max(
            newMoves.indexOf(lastVisibleMove),
            newMoves.indexOf(selectedMove)
            )
          );

          // Add new moves to set.
          if (newMoves.length) {
            this.newMoves = new Set([
              ...Array.from(this.newMoves.values()),
              ...newMoves
            ]);
            this.cd.detectChanges();
          }
        } else if (this.newMoves.size) {
          this.newMoves.clear();
          this.cd.detectChanges();
        }
      });
  }

  onMoveClick(id: number) {
    if (this.canChangeSelectedMove) {
      this.store$.dispatch(new SetSelectedMove({id}));
    }
  }

  selectLatMove() {
    this.store$.dispatch(new SetSelectedLastMove({boardId: this.board.id}));
  }

  onMoveIntersectScrollArea(move: IMove, isInside: boolean) {
    if (isInside) {
      this.movesInsideScrollArea.add(move);
      this.newMoves.delete(move);
      this.cd.detectChanges();
    } else {
      this.movesInsideScrollArea.delete(move);
    }
  }

  getLastMoveInsideScrollArea(): IMove {
    return Array.from(this.movesInsideScrollArea)
      .sort(fromMove.sortByMoveOrder)
      .pop();
  }

  groupMovesHasSelected(groupMoves) {
    return groupMoves.includes(this.selectedMove);
  }

  trackByMoveGroup(index, moves) {
    return moves;
  }

  trackByMove(index, item) {
    return item;
  }
}
