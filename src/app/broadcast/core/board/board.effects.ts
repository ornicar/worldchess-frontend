import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {AddPlayers} from '../player/player.actions';
import {BoardResourceService} from './board-resource.service';
import {AddBoards, BoardActionTypes, GetBoard, GetBoards, GetBoardsByTour, LoadBoards, UpsertBoard} from './board.actions';

@Injectable()
export class BoardEffects {

  constructor(
    private actions$: Actions,
    private boardResource: BoardResourceService) {}

  @Effect()
  board$: Observable<Action> = this.actions$.pipe(
    ofType<GetBoard>(BoardActionTypes.GetBoard),
    switchMap(({payload: {board_id}}) =>
      this.boardResource.getWithExpandAll(board_id)
        .pipe(
          switchMap(({players, board}) => [
            new UpsertBoard({ board }),
            new AddPlayers({ players })
          ])
        )
    )
  );

  @Effect()
  boards$: Observable<Action> = this.actions$.pipe(
    ofType<GetBoards>(BoardActionTypes.GetBoards),
    switchMap(() =>
      this.boardResource.getAll().pipe(
        map(boards => new LoadBoards({ boards }))
      )
    )
  );

  @Effect()
  boardsByTourWithExpandAll$: Observable<Action> = this.actions$.pipe(
    ofType<GetBoardsByTour>(BoardActionTypes.GetBoardsByTour),
    map((action: GetBoardsByTour) => action.payload.id),
    switchMap(id => this.boardResource.getByTourWithExpandAll(id)),
    switchMap(({players, boards}) => [
      new AddBoards({ boards }),
      new AddPlayers({ players })
    ])
  );

  // @Effect()
  // updateBoardState$: Observable<Action> = this.actions$.pipe(
  //   ofType<UpdateBoardState>(BoardActionTypes.UpdateBoardState),
  //   switchMap(({ payload }) =>
  //     this.boardResource.getState(payload.id).pipe(
  //       map(boardState => {
  //         const board: Update<IBoard> = {
  //           id: boardState.id,
  //           changes: {
  //             status: boardState.status,
  //             result: boardState.result,
  //             end_time: boardState.end_time,
  //             last_notification: boardState.last_notification,
  //           }
  //         };

  //         return new UpdateBoard({ board });
  //       })
  //     )
  //   )
  // );
}
