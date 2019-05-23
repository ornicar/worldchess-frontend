import {Update} from '@ngrx/entity';
import {Action} from '@ngrx/store';
import {IDefaultEntities} from '../models/default-entities';
import {IMatch} from './match.model';

export enum MatchActionTypes {
  SetSelectedMatch = '[Match] Set selected match',
  ClearSelectedMatch = '[Match] Clear selected match',
  GetMatch = '[Match] Get match',
  GetMatches = '[Match] Get all matches',
  GetMatchesByTour = '[Match] Get matches by tour',
  AddMatchDefaultEntities = '[Match] Add default entities for match',
  LoadMatches = '[Match] Load Matches',
  AddMatch = '[Match] Add Match',
  // UpsertMatch = '[Match] Upsert Match',
  AddMatches = '[Match] Add Matches',
  // UpsertMatches = '[Match] Upsert Matches',
  UpdateMatch = '[Match] Update Match',
  UpdateMatches = '[Match] Update Matches',
  DeleteMatch = '[Match] Delete Match',
  DeleteMatches = '[Match] Delete Matches',
  ClearMatches = '[Match] Clear Matches'
}

export class SetSelectedMatch implements Action {
  readonly type = MatchActionTypes.SetSelectedMatch;

  constructor(public payload: { id: number }) {}
}

export class ClearSelectedMatch implements Action {
  readonly type = MatchActionTypes.ClearSelectedMatch;

  constructor() {}
}

export class GetMatch implements Action {
  readonly type = MatchActionTypes.GetMatch;

  constructor(public payload: { id: number }) {}
}

export class GetMatches implements Action {
  readonly type = MatchActionTypes.GetMatches;

  constructor() {}
}

export class GetMatchesByTour implements Action {
  readonly type = MatchActionTypes.GetMatchesByTour;

  constructor(public payload: { id: number }) {}
}

export class AddMatchDefaultEntities implements Action {
  readonly type = MatchActionTypes.AddMatchDefaultEntities;

  constructor(public payload: { id: number, defaults: IDefaultEntities }) {}
}

export class LoadMatches implements Action {
  readonly type = MatchActionTypes.LoadMatches;

  constructor(public payload: { matches: IMatch[] }) {}
}

export class AddMatch implements Action {
  readonly type = MatchActionTypes.AddMatch;

  constructor(public payload: { match: IMatch }) {}
}
/*
export class UpsertMatch implements Action {
  readonly type = MatchActionTypes.UpsertMatch;

  constructor(public payload: { match: Update<IMatch> }) {}
}
*/
export class AddMatches implements Action {
  readonly type = MatchActionTypes.AddMatches;

  constructor(public payload: { matches: IMatch[] }) {}
}
/*
export class UpsertMatches implements Action {
  readonly type = MatchActionTypes.UpsertMatches;

  constructor(public payload: { matches: Update<IMatch>[] }) {}
}
*/
export class UpdateMatch implements Action {
  readonly type = MatchActionTypes.UpdateMatch;

  constructor(public payload: { match: Update<IMatch> }) {}
}

export class UpdateMatches implements Action {
  readonly type = MatchActionTypes.UpdateMatches;

  constructor(public payload: { matches: Update<IMatch>[] }) {}
}

export class DeleteMatch implements Action {
  readonly type = MatchActionTypes.DeleteMatch;

  constructor(public payload: { id: number }) {}
}

export class DeleteMatches implements Action {
  readonly type = MatchActionTypes.DeleteMatches;

  constructor(public payload: { ids: number[] }) {}
}

export class ClearMatches implements Action {
  readonly type = MatchActionTypes.ClearMatches;
}

export type MatchActions =
  SetSelectedMatch
 | ClearSelectedMatch
 | GetMatch
 | GetMatches
 | AddMatchDefaultEntities
 | LoadMatches
 | AddMatch
 // | UpsertMatch
 | AddMatches
 // | UpsertMatches
 | UpdateMatch
 | UpdateMatches
 | DeleteMatch
 | DeleteMatches
 | ClearMatches;
