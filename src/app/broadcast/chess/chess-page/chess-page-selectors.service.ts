import {Injectable} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {distinctUntilChanged, filter, switchMap, tap} from 'rxjs/operators';
import {IBoard} from '../../core/board/board.model';
import {IMove} from '../../move/move.model';
import * as fromMove from '../../move/move.reducer';

@Injectable()
export class ChessPageSelectorsService {

  constructor(private store$: Store<fromMove.State>) {}

  public selectCurrentMoveId$(board$: Observable<IBoard>): Observable<number> {
    const selectSelectedMove = fromMove.selectSelectedMoveId();

    return board$.pipe(
      distinctUntilChanged((prev, next) => (prev && prev.id) !== (next && next.id)),
      switchMap(board => board
        ? this.store$.pipe(
          select(selectSelectedMove, { boardId: board.id }),
          distinctUntilChanged()
        )
        : of(null)
      )
    );
  }

  public selectBoardMoves$(board$: Observable<IBoard>): Observable<IMove[]> {
    const selectBoardMoves = fromMove.selectBoardMoves();

    return board$.pipe(
      switchMap(board => board
        ? this.store$.pipe(
          select(selectBoardMoves, { boardId: board.id })
        )
        : of([])
      )
    );

      /* test
      map(moves => {
        const vals = ['10:23:54', '12:23:54', '00:23:54', '00:00:54', '00:00:01', 'erer', '12:34:54', '12:23:34'];
        moves.forEach(move => {
          if (vals.length > 0) {
            move.time_spent = vals[0];
            vals.shift();
          } else {
            move.time_spent = null;
          }
        });
        return moves;
      })*/
  }
}
