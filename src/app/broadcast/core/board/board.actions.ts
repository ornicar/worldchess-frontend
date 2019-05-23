import {Update} from '@ngrx/entity';
import {Action} from '@ngrx/store';
import {IBoard} from './board.model';

export enum BoardActionTypes {
  GetBoards = '[Board] Get all boards',
  GetBoard = '[Board] Get board by id',
  GetBoardsByTour = '[Board] Get all boards of tour',
  // UpdateBoardState = '[Board] Update board state',
  LoadBoards = '[Board] Load Boards',
  AddBoard = '[Board] Add Board',
  AddBoardsToFavorites = '[Board] Add Boards to favorites list',
  RemoveBoardsFromFavorites = '[Board] Remove Boards from favorites list',
  UpsertBoard = '[Board] Upsert Board',
  AddBoards = '[Board] Add Boards',
  // UpsertBoards = '[Board] Upsert Boards',
  UpdateBoard = '[Board] Update Board',
  UpdateBoards = '[Board] Update Boards',
  DeleteBoard = '[Board] Delete Board',
  DeleteBoards = '[Board] Delete Boards',
  ClearBoards = '[Board] Clear Boards'
}

export class GetBoards implements Action {
  readonly type = BoardActionTypes.GetBoards;

  constructor() {}
}

export class GetBoard implements Action {
  readonly type = BoardActionTypes.GetBoard;

  constructor(public payload: { board_id: number }) {}
}

export class GetBoardsByTour implements Action {
  readonly type = BoardActionTypes.GetBoardsByTour;

  constructor(public payload: { id: number }) {}
}

// export class UpdateBoardState implements Action {
//   readonly type = BoardActionTypes.UpdateBoardState;

//   constructor(public payload: { id: number }) {}
// }

export class LoadBoards implements Action {
  readonly type = BoardActionTypes.LoadBoards;

  constructor(public payload: { boards: IBoard[] }) {}
}

export class AddBoard implements Action {
  readonly type = BoardActionTypes.AddBoard;

  constructor(public payload: { board: IBoard }) {}
}

export class UpsertBoard implements Action {
  readonly type = BoardActionTypes.UpsertBoard;

  constructor(public payload: { board: IBoard }) {}
}

export class AddBoards implements Action {
  readonly type = BoardActionTypes.AddBoards;

  constructor(public payload: { boards: IBoard[] }) {}
}

/*
export class UpsertBoards implements Action {
  readonly type = BoardActionTypes.UpsertBoards;

  constructor(public payload: { boards: Update<IBoard>[] }) {}
}
*/
export class UpdateBoard implements Action {
  readonly type = BoardActionTypes.UpdateBoard;

  constructor(public payload: { board: Update<IBoard> }) {}
}

export class UpdateBoards implements Action {
  readonly type = BoardActionTypes.UpdateBoards;

  constructor(public payload: { boards: Update<IBoard>[] }) {}
}

export class DeleteBoard implements Action {
  readonly type = BoardActionTypes.DeleteBoard;

  constructor(public payload: { id: number }) {}
}

export class DeleteBoards implements Action {
  readonly type = BoardActionTypes.DeleteBoards;

  constructor(public payload: { ids: number[] }) {}
}

export class ClearBoards implements Action {
  readonly type = BoardActionTypes.ClearBoards;
}

export type BoardActions =
  GetBoards
//  | UpdateBoardState
 | LoadBoards
 | AddBoard
 | UpsertBoard
 | AddBoards
 // | UpsertBoards
 | UpdateBoard
 | UpdateBoards
 | DeleteBoard
 | DeleteBoards
 | ClearBoards;
