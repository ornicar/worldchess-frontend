import {Update} from '@ngrx/entity';
import {Action} from '@ngrx/store';
import {IPlayer} from './player.model';

export enum PlayerActionTypes {
  GetPlayers = '[Player] Get all players',
  GetPlayersById = '[Player] Get players by id',
  LoadPlayers = '[Player] Load Players',
  LoadPlayersById = '[Player] Load Players by id',
  AddPlayer = '[Player] Add Player',
  // UpsertPlayer = '[Player] Upsert Player',
  AddPlayers = '[Player] Add Players',
  // UpsertPlayers = '[Player] Upsert Players',
  UpdatePlayer = '[Player] Update Player',
  UpdatePlayers = '[Player] Update Players',
  DeletePlayer = '[Player] Delete Player',
  DeletePlayers = '[Player] Delete Players',
  ClearPlayers = '[Player] Clear Players'
}

export class GetPlayers implements Action {
  readonly type = PlayerActionTypes.GetPlayers;

  constructor() {}
}

export class LoadPlayers implements Action {
  readonly type = PlayerActionTypes.LoadPlayers;

  constructor(public payload: { players: IPlayer[] }) {}
}

export class AddPlayer implements Action {
  readonly type = PlayerActionTypes.AddPlayer;

  constructor(public payload: { player: IPlayer }) {}
}
/*
export class UpsertPlayer implements Action {
  readonly type = PlayerActionTypes.UpsertPlayer;

  constructor(public payload: { player: Update<IPlayer> }) {}
}
*/
export class AddPlayers implements Action {
  readonly type = PlayerActionTypes.AddPlayers;

  constructor(public payload: { players: IPlayer[] }) {}
}
/*
export class UpsertPlayers implements Action {
  readonly type = PlayerActionTypes.UpsertPlayers;

  constructor(public payload: { players: Update<IPlayer>[] }) {}
}
*/
export class UpdatePlayer implements Action {
  readonly type = PlayerActionTypes.UpdatePlayer;

  constructor(public payload: { player: Update<IPlayer> }) {}
}

export class UpdatePlayers implements Action {
  readonly type = PlayerActionTypes.UpdatePlayers;

  constructor(public payload: { players: Update<IPlayer>[] }) {}
}

export class DeletePlayer implements Action {
  readonly type = PlayerActionTypes.DeletePlayer;

  constructor(public payload: { id: number }) {}
}

export class DeletePlayers implements Action {
  readonly type = PlayerActionTypes.DeletePlayers;

  constructor(public payload: { ids: number[] }) {}
}

export class ClearPlayers implements Action {
  readonly type = PlayerActionTypes.ClearPlayers;
}

export class GetPlayersById implements Action {
  readonly type = PlayerActionTypes.GetPlayersById;

  constructor(public payload: { ids: number[] }) {}
}

export class LoadPlayersById implements Action {
  readonly type = PlayerActionTypes.LoadPlayersById;

  constructor(public payload: { players: IPlayer[] }) {}
}

export type PlayerActions =
 LoadPlayers
 | AddPlayer
 // | UpsertPlayer
 | AddPlayers
 // | UpsertPlayers
 | UpdatePlayer
 | UpdatePlayers
 | DeletePlayer
 | DeletePlayers
 | ClearPlayers
 | GetPlayersById
 | LoadPlayersById;
