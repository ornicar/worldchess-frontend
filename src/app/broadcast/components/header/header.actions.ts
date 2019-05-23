import { Action } from '@ngrx/store';
import { CommonTournament, IGetTournamentsOptions } from '../../core/tournament/tournament.model';
import { IEvent } from '../../core/event/event.model';
import { ITour } from '../../core/tour/tour.model';
import { IMatch } from '../../core/match/match.model';
import { IBoard } from '../../core/board/board.model';

export enum HeaderActionTypes {
  GetTournaments = '[Header] Get tournaments',
  LoadTournaments = '[Header] Load tournaments',
  GetEvents = '[Header] Get events',
  LoadEvents = '[Header] Load events',
  GetTours = '[Header] Get tours',
  LoadTours = '[Header] Load tours',
  GetMatches = '[Header] Get matches',
  LoadMatches = '[Header] Load matches',
  GetBoards = '[Header] Get boards',
  LoadBoards = '[Header] Load boards'
}

export class GetTournaments implements Action {
  readonly type = HeaderActionTypes.GetTournaments;

  constructor(public payload: { options: IGetTournamentsOptions }) {}
}

export class LoadTournaments implements Action {
  readonly type = HeaderActionTypes.LoadTournaments;

  constructor(public payload: { tournaments: CommonTournament[] }) {}
}

export class GetEvents implements Action {
  readonly type = HeaderActionTypes.GetEvents;

  constructor() {}
}

export class LoadEvents implements Action {
  readonly type = HeaderActionTypes.LoadEvents;

  constructor(public payload: { events: IEvent[] }) {}
}

export class GetTours implements Action {
  readonly type = HeaderActionTypes.GetTours;

  constructor() {}
}

export class LoadTours implements Action {
  readonly type = HeaderActionTypes.LoadTours;

  constructor(public payload: { tours: ITour[] }) {}
}

export class GetMatches implements Action {
  readonly type = HeaderActionTypes.GetMatches;

  constructor() {}
}

export class LoadMatches implements Action {
  readonly type = HeaderActionTypes.LoadMatches;

  constructor(public payload: { matches: IMatch[] }) {}
}

export class GetBoards implements Action {
  readonly type = HeaderActionTypes.GetBoards;

  constructor() {}
}

export class LoadBoards implements Action {
  readonly type = HeaderActionTypes.LoadBoards;

  constructor(public payload: { boards: IBoard[] }) {}
}

export type HeaderActions = GetEvents
  | LoadEvents
  | GetTournaments
  | LoadTournaments
  | GetTours
  | LoadTours
  | GetMatches
  | LoadMatches
  | GetBoards
  | LoadBoards;
