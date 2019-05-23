import {Action} from '@ngrx/store';
import {IBoard} from '../core/board/board.model';
import {FavoriteBoardsDocumentStatus} from './favorite-boards.reducer';

export enum FavoriteBoardsActionTypes {
  GetFavoriteBoards = '[Favorite boards] Get all favorite boards in store',
  GetFavoriteBoardsSuccess = '[Favorite boards] Get all favorite boards in store success',
  GetFavoriteBoardsError = '[Favorite boards] Get all favorite boards in store error',

  UpdateFavoriteBoards = '[Favorite boards] Update all favorite boards in store',
  UpdateFavoriteBoardsSuccess = '[Favorite boards] Update all favorite boards in store success',
  UpdateFavoriteBoardsError = '[Favorite boards] Update all favorite boards in store error',

  SetDocumentStatus = '[Favorite boards] Set document status of favorite boards',
  ResetFavoriteBoards = '[Favorite boards] Reset favorite boards store',
  GiveAccessFavoriteBoards = '[Favorite boards] Give access for favorites',
  RestrictAccessFavoriteBoards = '[Favorite boards] Restrict access for favorites',

  InitFavoriteBoards = '[Favorite boards] Init favorite boards',
  AddBoardsToFavorite = '[Favorite boards] Add Boards to favorite list',
  RemoveBoardsFromFavorite = '[Favorite boards] Remove Boards from favorite list'
}

export class GetFavoriteBoards implements Action {
  readonly type = FavoriteBoardsActionTypes.GetFavoriteBoards;

  constructor() {}
}

export class GetFavoriteBoardsSuccess implements Action {
  readonly type = FavoriteBoardsActionTypes.GetFavoriteBoardsSuccess;

  constructor(public payload: { boardsIds: IBoard['id'][] }) {}
}

export class GetFavoriteBoardsError implements Action {
  readonly type = FavoriteBoardsActionTypes.GetFavoriteBoardsError;

  constructor() {}
}

export class UpdateFavoriteBoards implements Action {
  readonly type = FavoriteBoardsActionTypes.UpdateFavoriteBoards;

  constructor(public payload: { boardsIds: IBoard['id'][] }) {}
}

export class UpdateFavoriteBoardsSuccess implements Action {
  readonly type = FavoriteBoardsActionTypes.UpdateFavoriteBoardsSuccess;

  constructor(public payload: { boardsIds: IBoard['id'][] }) {}
}

export class UpdateFavoriteBoardsError implements Action {
  readonly type = FavoriteBoardsActionTypes.UpdateFavoriteBoardsError;

  constructor() {}
}

export class SetFavoriteBoardsDocumentStatus implements Action {
  readonly type = FavoriteBoardsActionTypes.SetDocumentStatus;

  constructor(public payload: { documentStatus: FavoriteBoardsDocumentStatus }) {}
}

export class ResetFavoriteBoards implements Action {
  readonly type = FavoriteBoardsActionTypes.ResetFavoriteBoards;

  constructor() {}
}

export class GiveAccessFavoriteBoards implements Action {
  readonly type = FavoriteBoardsActionTypes.GiveAccessFavoriteBoards;

  constructor() {}
}

export class RestrictAccessFavoriteBoards implements Action {
  readonly type = FavoriteBoardsActionTypes.RestrictAccessFavoriteBoards;

  constructor() {}
}


export class InitFavoriteBoards implements Action {
  readonly type = FavoriteBoardsActionTypes.InitFavoriteBoards;

  constructor() {}
}

export class AddBoardsToFavorite implements Action {
  readonly type = FavoriteBoardsActionTypes.AddBoardsToFavorite;

  constructor(public payload: { boardsIds: IBoard['id'][] }) {}
}

export class RemoveBoardsFromFavorite implements Action {
  readonly type = FavoriteBoardsActionTypes.RemoveBoardsFromFavorite;

  constructor(public payload: { boardsIds: IBoard['id'][] }) {}
}

export type FavoriteBoardsActions =
  GetFavoriteBoards
  | GetFavoriteBoardsSuccess
  | GetFavoriteBoardsError
  | UpdateFavoriteBoards
  | UpdateFavoriteBoardsSuccess
  | UpdateFavoriteBoardsError
  | SetFavoriteBoardsDocumentStatus
  | ResetFavoriteBoards
  | GiveAccessFavoriteBoards
  | RestrictAccessFavoriteBoards
  | InitFavoriteBoards
  | AddBoardsToFavorite
  | RemoveBoardsFromFavorite;
