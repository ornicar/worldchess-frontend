import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Color} from 'chessground/types';
import {BehaviorSubject, Observable, of, zip} from 'rxjs';
import {filter, map, mapTo, shareReplay, switchMap, tap} from 'rxjs/operators';
import * as fromRoot from '../../../../reducers';
import {OnChangesInputObservable, OnChangesObservable} from '../../../../shared/decorators/observable-input';
import {BoardStatus, IBoard} from '../../../core/board/board.model';
import {selectBoard} from '../../../core/board/board.reducer';
import {IMove, IMovePosition, MoveReaction} from '../../../move/move.model';
import {selectBoardLastMove, selectSelectedMove} from '../../../move/move.reducer';
import {ChessBoardViewMode} from '../chess-board/chess-board.component';

@Component({
  selector: 'wc-broadcast-multiple-chess-board-controller',
  templateUrl: './broadcast-multiple-chess-board-controller.component.html',
  styleUrls: ['./broadcast-multiple-chess-board-controller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BroadcastMultipleChessBoardControllerComponent implements OnInit, OnChanges {

  @Input()
  isSelected = false;

  @Input()
  viewMode = ChessBoardViewMode.Normal;

  @Input()
  boardId?: IBoard['id'] = null;

  @Input()
  bottomPlayerColor: Color = 'white';

  @OnChangesInputObservable()
  boardId$ = new BehaviorSubject<IBoard['id']>(this.boardId);

  @OnChangesInputObservable('isSelected')
  boardIsSelected$ = new BehaviorSubject<boolean>(this.isSelected);

  private selectBoard = selectBoard();
  private selectBoardLastMove = selectBoardLastMove();
  private selectSelectedMove = selectSelectedMove();

  board$: Observable<IBoard> = this.boardId$.pipe(
    switchMap(boardId => boardId
      ? this.store$.pipe(select(this.selectBoard, {boardId}))
      : of(null)
    ),
    shareReplay(1)
  );

  // @todo How to detect when board or moves is loading? Create props into store (board, moves).
  isLoading$: Observable<boolean> = this.board$.pipe(
    map(board => !board),
    shareReplay(1)
  );

  isNotExpected$: Observable<boolean> = this.board$.pipe(
    map(board => board.status !== BoardStatus.EXPECTED),
    shareReplay(1)
  );

  private lastMove$: Observable<IMove> = this.boardId$.pipe(
    switchMap(boardId => boardId
      ? this.store$.pipe(select(this.selectBoardLastMove, {boardId}))
      : of(null)
    ),
    shareReplay(1)
  );

  private selectedMove$: Observable<IMove> = this.boardId$.pipe(
    switchMap(boardId => boardId
      ? this.store$.pipe(select(this.selectSelectedMove, {boardId}))
      : of(null)
    ),
    shareReplay(1)
  );

  private move$: Observable<IMove> = this.boardIsSelected$.pipe(
    switchMap(isSelected => isSelected ? this.selectedMove$ : this.lastMove$),
    shareReplay(1),
  );

  public position$: Observable<IMovePosition> = zip(this.isLoading$, this.isNotExpected$).pipe(
    // When all moves is loaded.
    switchMap(([isLoading, isNotExpected]) => !isLoading && isNotExpected
      ? this.move$
      : of(null)
    ),
    shareReplay(1)
  );

  public moveScore$: Observable<number> = zip(this.isLoading$, this.isNotExpected$).pipe(
    // When all moves is loaded.
    switchMap(([isLoading, isNotExpected]) => !isLoading && isNotExpected
      ? this.move$
      : of(null)
    ),
    map((move: IMove) => move ? move.stockfish_score : 0),
    shareReplay(1)
  );

  public moveReaction$: Observable<number> = zip(this.isLoading$, this.isNotExpected$).pipe(
    // When all moves is loaded.
    switchMap(([isLoading, isNotExpected]) => !isLoading && isNotExpected
      ? this.move$
      : of(null)
    ),
    map((move: IMove) => move ? move.reaction : null),
    filter(reaction => [
      MoveReaction.MATE_IN_LS_10,
      MoveReaction.MAJOR_CHANGE_OF_SITUATION,
      MoveReaction.BLUNDER].includes(reaction)
    ),
    shareReplay(1)
  );

  constructor(private store$: Store<fromRoot.State>) { }

  ngOnInit() {
  }

  @OnChangesObservable()
  ngOnChanges() { }
}
