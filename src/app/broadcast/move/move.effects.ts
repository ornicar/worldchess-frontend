import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action, select, Store} from '@ngrx/store';
import {EMPTY, Observable, of} from 'rxjs';
import {fromArray} from 'rxjs/internal/observable/fromArray';
import {catchError, filter, flatMap, map, switchMap, take, tap} from 'rxjs/operators';
import * as fromRoot from '../../reducers';
import {MoveResourceService} from './move-resource.service';
import {
  GetMoves,
  LoadMoves,
  MoveActionTypes,
  GetMovesByBoard,
  AddMove,
  SetSelectedLastMove,
  SetSelectedMove,
  ClearPredictedMove,
  AddMoves,
  GetLastMovesByBoards,
} from './move.actions';
import { IMove } from './move.model';
import {selectBoardMovesIds, selectMoveStore} from './move.reducer';

@Injectable()
export class MoveEffects {

  private selectBoardMovesIds = selectBoardMovesIds();

  constructor(
    private actions$: Actions,
    private store$: Store<fromRoot.State>,
    private moveResource: MoveResourceService,
  ) {}

  @Effect()
  moves$: Observable<Action> = this.actions$.pipe(
    ofType<GetMoves>(MoveActionTypes.GetMoves),
    switchMap(() =>
      this.moveResource.getAll().pipe(
        map(moves => new LoadMoves({ moves }))
      )
    )
  );

  @Effect()
  GetMovesByBoard$: Observable<Action> = this.actions$.pipe(
    ofType<GetMovesByBoard>(MoveActionTypes.GetMovesByBoard),
    switchMap((action: GetMovesByBoard) =>
      this.moveResource
        .getByBoard(action.payload.board_id).pipe(
          map((moves: IMove[]) => new AddMoves({ moves })),
          // When server error.
          catchError(e => {
            console.error(e);

            return EMPTY;
          })
        )
    )
  );

  @Effect()
  GetLastMovesByBoards$: Observable<Action> = this.actions$.pipe(
    ofType<GetLastMovesByBoards>(MoveActionTypes.GetLastMovesByBoards),
    switchMap((action: GetLastMovesByBoards) =>
      this.moveResource
        .getLastByBoards(action.payload.boardsIds).pipe(
        map((moves: IMove[]) => new AddMoves({ moves })),
        // When server error.
        catchError(e => {
          console.error(e);

          return EMPTY;
        })
      )
    )
  );

  @Effect()
  clearPredictPosition$: Observable<Action> = this.actions$.pipe(
    ofType<SetSelectedMove>(MoveActionTypes.SetSelectedMove),
    map(() => new ClearPredictedMove())
  );

  @Effect()
  selectedLastMove$: Observable<Action> = this.actions$.pipe(
    ofType<SetSelectedLastMove>(MoveActionTypes.SetSelectedLastMove),
    flatMap(({ payload: { boardId } }: SetSelectedLastMove) =>
      this.store$.pipe(
        select(this.selectBoardMovesIds, { boardId }),
        take(1),
        flatMap(ids => ids.length
          ? of(new SetSelectedMove({ id: ids[ids.length - 1] }))
          : EMPTY
        )
      )
    )
  );

  @Effect()
  updateLastSelectedMove$: Observable<Action> = this.actions$.pipe(
    ofType<AddMove | AddMoves | AddMoves | LoadMoves>(
      MoveActionTypes.AddMove,
      MoveActionTypes.AddMoves,
      MoveActionTypes.LoadMoves
    ),
    flatMap(({ type, payload }) => {
      return this.store$.pipe(
        select(selectMoveStore),
        take(1),
        filter(({ enableAutoSelect }) => enableAutoSelect),
        flatMap(({ boardNotLastMoveSelected }) => {
          const moves = type === MoveActionTypes.AddMove
            ? [(<AddMove['payload']>payload).move]
            : (<AddMoves['payload']>payload).moves;

          const boards = moves
            .map(move => move.board)
            .filter((boardId, index, list) =>
              // unique
              list.indexOf(boardId) === index
              // when the current last move is select.
              && !boardNotLastMoveSelected[boardId]
            );

          return fromArray(boards).pipe(map(boardId => new SetSelectedLastMove({ boardId })));
        })
      );
    })
  );
}
