import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {BehaviorSubject, Observable, of, zip} from 'rxjs';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {ChessBoardViewMode} from '../../../../app/broadcast/chess/chess-page/chess-board/chess-board.component';
import {BoardStatus, IBoard} from '../../../../app/broadcast/core/board/board.model';
import {selectBoard} from '../../../../app/broadcast/core/board/board.reducer';
import {IMove, IMovePosition} from '../../../../app/broadcast/move/move.model';
import {selectSelectedMove} from '../../../../app/broadcast/move/move.reducer';
import {OnChangesInputObservable, OnChangesObservable} from '../../../../app/shared/decorators/observable-input';
import * as fromRoot from '../../reducers';

@Component({
  selector: 'wc-widget-chess-board-controller',
  templateUrl: './widget-chess-board-controller.component.html',
  styleUrls: ['./widget-chess-board-controller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetChessBoardControllerComponent implements OnInit, OnChanges {

  @Input()
  viewMode = ChessBoardViewMode.WidgetVertical;

  @Input()
  boardId?: IBoard['id'] = null;

  @OnChangesInputObservable()
  boardId$ = new BehaviorSubject<IBoard['id']>(this.boardId);

  private selectBoard = selectBoard();
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

  private selectedMove$: Observable<IMove> = this.boardId$.pipe(
    switchMap(boardId => boardId
      ? this.store$.pipe(select(this.selectSelectedMove, {boardId}))
      : of(null)
    ),
    shareReplay(1)
  );

  public position$: Observable<IMovePosition> = zip(this.isLoading$, this.isNotExpected$).pipe(
    // When all moves is loaded.
    switchMap(([isLoading, isNotExpected]) => !isLoading && isNotExpected
      ? this.selectedMove$
      : of(null)
    ),
    shareReplay(1)
  );

  public moveScore$: Observable<number> = zip(this.isLoading$, this.isNotExpected$).pipe(
    // When all moves is loaded.
    switchMap(([isLoading, isNotExpected]) => !isLoading && isNotExpected
      ? this.selectedMove$
      : of(null)
    ),
    map((move: IMove) => move ? move.stockfish_score : 0),
    shareReplay(1)
  );

  constructor(private store$: Store<fromRoot.State>) { }

  ngOnInit() {
  }

  @OnChangesObservable()
  ngOnChanges() { }
}
