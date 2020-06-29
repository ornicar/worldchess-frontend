import {Update} from '@ngrx/entity';
import {Action} from '@ngrx/store';
import {IMove, IPredictPosition} from './move.model';

export enum MoveActionTypes {
  GetMoves = '[Move] Get Moves',
  GetMovesByBoard = '[Move] Get Moves By Board',
  GetLastMovesByBoards = '[Move] Get Last Moves By Boards',
  LoadMoves = '[Move] Load Moves',
  AddMove = '[Move] Add Move',
  UpsertMove = '[Move] Upsert Move',
  AddMoves = '[Move] Add Moves',
  // UpsertMoves = '[Move] Upsert Moves', not used (produced error)
  UpdateMove = '[Move] Update Move',
  UpdateMoves = '[Move] Update Moves',
  DeleteMove = '[Move] Delete Move',
  DeleteMoves = '[Move] Delete Moves',
  ClearMoves = '[Move] Clear Moves',
  SetSelectedMove = '[Move] Set Selected Move',
  SetSelectedLastMove = '[Move] Set Selected last move',
  SetPredictedMove = '[Move] Set Predicted Move',
  ClearPredictedMove = '[Move] Clear Predicted Move',
  EnableAutoSelectMove = '[Move] Enable auto select last move',
  DisableAutoSelectMove = '[Move] Disable auto select last move'
}

export class GetMoves implements Action {
  readonly type = MoveActionTypes.GetMoves;

  constructor() {}
}

export class GetMovesByBoard implements Action {
  readonly type = MoveActionTypes.GetMovesByBoard;

  constructor(public payload: { board_id: number }) {}
}

export class GetLastMovesByBoards implements Action {
  readonly type = MoveActionTypes.GetLastMovesByBoards;

  constructor(public payload: { boardsIds: number[] }) {}
}

export class GetLastMovesByBoardsTournaments implements Action {
  readonly type = MoveActionTypes.GetLastMovesByBoards;

  constructor(public payload: { boardsIds: string[] }) {}
}

export class LoadMoves implements Action {
  readonly type = MoveActionTypes.LoadMoves;

  constructor(public payload: { moves: IMove[] }) {}
}

export class AddMove implements Action {
  readonly type = MoveActionTypes.AddMove;

  constructor(public payload: { move: IMove }) {}
}

export class UpsertMove implements Action {
  readonly type = MoveActionTypes.UpsertMove;

  constructor(public payload: { move: IMove }) {}
}

export class AddMoves implements Action {
  readonly type = MoveActionTypes.AddMoves;

  constructor(public payload: { moves: IMove[] }) {}
}
/*
export class UpsertMoves implements Action {
  readonly type = MoveActionTypes.UpsertMoves;

  constructor(public payload: { moves: Update<IMove>[] }) {}
}
*/
export class UpdateMove implements Action {
  readonly type = MoveActionTypes.UpdateMove;

  constructor(public payload: { move: Update<IMove> }) {}
}

export class UpdateMoves implements Action {
  readonly type = MoveActionTypes.UpdateMoves;

  constructor(public payload: { moves: Update<IMove>[] }) {}
}

export class DeleteMove implements Action {
  readonly type = MoveActionTypes.DeleteMove;

  constructor(public payload: { id: number }) {}
}

export class DeleteMoves implements Action {
  readonly type = MoveActionTypes.DeleteMoves;

  constructor(public payload: { ids: number[] }) {}
}

export class ClearMoves implements Action {
  readonly type = MoveActionTypes.ClearMoves;
}

export class SetSelectedMove implements Action {
  readonly type = MoveActionTypes.SetSelectedMove;

  constructor(public payload: { id: number }) {}
}

export class SetSelectedLastMove implements Action {
  readonly type = MoveActionTypes.SetSelectedLastMove;

  constructor(public payload: { boardId: number }) {}
}

export class SetPredictedMove implements Action {
  readonly type = MoveActionTypes.SetPredictedMove;

  constructor(public payload: { moveId: number, variationMoveId?: string, predictPosition: IPredictPosition }) {}
}

export class ClearPredictedMove implements Action {
  readonly type = MoveActionTypes.ClearPredictedMove;

  constructor() {}
}

export class EnableAutoSelectMove implements Action {
  readonly type = MoveActionTypes.EnableAutoSelectMove;

  constructor() {}
}

export class DisableAutoSelectMove implements Action {
  readonly type = MoveActionTypes.DisableAutoSelectMove;

  constructor() {}
}

export type MoveActions =
 GetMoves
 | GetLastMovesByBoards
 | LoadMoves
 | AddMove
 | UpsertMove
 | AddMoves
 // | UpsertMoves
 | UpdateMove
 | UpdateMoves
 | DeleteMove
 | DeleteMoves
 | SetSelectedLastMove
 | SetSelectedMove
 | ClearMoves
 | SetPredictedMove
 | ClearPredictedMove
 | EnableAutoSelectMove
 | DisableAutoSelectMove;
