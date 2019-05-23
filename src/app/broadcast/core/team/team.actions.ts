import {Update} from '@ngrx/entity';
import {Action} from '@ngrx/store';
import {ITeam} from './team.model';

export enum TeamActionTypes {
  SetFooterSelectedTeam = '[Team] Set footer selected team',
  ClearFooterSelectedTeam = '[Team] Clear footer selected team',
  GetTeamsByTournamentId = '[Team] Get teams by tournament id',
  LoadTeams = '[Team] Load Teams',
  AddTeam = '[Team] Add Team',
  // UpsertTeam = '[Team] Upsert Team',
  AddTeams = '[Team] Add Teams',
  // UpsertTeams = '[Team] Upsert Teams',
  UpdateTeam = '[Team] Update Team',
  UpdateTeams = '[Team] Update Teams',
  DeleteTeam = '[Team] Delete Team',
  DeleteTeams = '[Team] Delete Teams',
  ClearTeams = '[Team] Clear Teams'
}

export class LoadTeams implements Action {
  readonly type = TeamActionTypes.LoadTeams;

  constructor(public payload: { teams: ITeam[] }) { }
}

export class AddTeam implements Action {
  readonly type = TeamActionTypes.AddTeam;

  constructor(public payload: { team: ITeam }) { }
}
/*
export class UpsertTeam implements Action {
  readonly type = TeamActionTypes.UpsertTeam;

  constructor(public payload: { team: Update<ITeam> }) {}
}
*/
export class AddTeams implements Action {
  readonly type = TeamActionTypes.AddTeams;

  constructor(public payload: { teams: ITeam[] }) { }
}
/*
export class UpsertTeams implements Action {
  readonly type = TeamActionTypes.UpsertTeams;

  constructor(public payload: { teams: Update<ITeam>[] }) {}
}
*/
export class UpdateTeam implements Action {
  readonly type = TeamActionTypes.UpdateTeam;

  constructor(public payload: { team: Update<ITeam> }) { }
}

export class UpdateTeams implements Action {
  readonly type = TeamActionTypes.UpdateTeams;

  constructor(public payload: { teams: Update<ITeam>[] }) { }
}

export class DeleteTeam implements Action {
  readonly type = TeamActionTypes.DeleteTeam;

  constructor(public payload: { id: number }) { }
}

export class DeleteTeams implements Action {
  readonly type = TeamActionTypes.DeleteTeams;

  constructor(public payload: { ids: number[] }) { }
}

export class ClearTeams implements Action {
  readonly type = TeamActionTypes.ClearTeams;
}

export class SetFooterSelectedTeam implements Action {
  readonly type = TeamActionTypes.SetFooterSelectedTeam;

  constructor(public payload: { id: number}) {}
}

export class ClearFooterSelectedTeam implements Action {
  readonly type = TeamActionTypes.ClearFooterSelectedTeam;

  constructor() {}
}

export class GetTeamsByTournamentId implements Action {
  readonly type = TeamActionTypes.GetTeamsByTournamentId;

  constructor(public payload: { id: number }) {}
}

export type TeamActions =
  SetFooterSelectedTeam
  | ClearFooterSelectedTeam
  | LoadTeams
  | AddTeam
  // | UpsertTeam
  | AddTeams
  // | UpsertTeams
  | UpdateTeam
  | UpdateTeams
  | DeleteTeam
  | DeleteTeams
  | ClearTeams;
