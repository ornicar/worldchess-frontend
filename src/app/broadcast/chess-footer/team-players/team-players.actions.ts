import { Action } from '@ngrx/store';
import { ITeamPlayer } from './team-players.model';
import { ITeamPlayersParams } from './team-players-resource.service';

export enum TeamPlayersActionTypes {
  LoadSelectedTeamPlayers = '[TeamPlayers] Load selected TeamPlayers',
  ClearSelectedTeamPlayers = '[TeamPlayers] Clear selected TeamPlayers',
  AddTeamPlayers = '[TeamPlayers] Add next TeamPlayers', // @Comment for pagination
  ClearTeamPlayers = '[TeamPlayers] Clear all TeamPlayers',
  GetTeamPlayersWithParams = '[TeamPlayers] Get next TeamPlayers with params',
  GetSelectedTeamPlayersWithParams = '[TeamPlayers] Get Selected TeamPlayers with params', // @Comment also can be used for pagination
}

export class LoadSelectedTeamPlayers implements Action {
  readonly type = TeamPlayersActionTypes.LoadSelectedTeamPlayers;

  constructor(public payload: { teamPlayers: ITeamPlayer[] }) { }
}

export class ClearSelectedTeamPlayers implements Action {
  readonly type = TeamPlayersActionTypes.ClearSelectedTeamPlayers;

  constructor() {}
}
export class AddTeamPlayers implements Action {
  readonly type = TeamPlayersActionTypes.AddTeamPlayers;

  constructor(public payload: { teamPlayers: ITeamPlayer[], count: number }) { }
}

export class ClearTeamPlayers implements Action {
  readonly type = TeamPlayersActionTypes.ClearTeamPlayers;
}

export class GetTeamPlayersWithParams implements Action {
  readonly type = TeamPlayersActionTypes.GetTeamPlayersWithParams;

  constructor(public payload?: { params: ITeamPlayersParams }) {
  }
}

export class GetSelectedTeamPlayersWithParams implements Action {
  readonly type = TeamPlayersActionTypes.GetSelectedTeamPlayersWithParams;

  constructor(public payload?: { params: ITeamPlayersParams }) {
  }
}

export type TeamPlayersActions =
  LoadSelectedTeamPlayers |
  ClearSelectedTeamPlayers |
  AddTeamPlayers |
  ClearTeamPlayers |
  GetTeamPlayersWithParams |
  GetSelectedTeamPlayersWithParams;
