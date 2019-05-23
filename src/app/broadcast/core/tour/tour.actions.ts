import {Update} from '@ngrx/entity';
import {Action} from '@ngrx/store';
import {ITour} from './tour.model';

export enum TourActionTypes {
  SetSelectedTour = '[Tour] Set selected tour',
  ClearSelectedTour = '[Tour] Clear selected tour',
  GetTour = '[Tour] Get Tour',
  GetTours = '[Tour] Get all tours',
  GetToursByTournament = '[Tour] Get tours by tournament',
  LoadTours = '[Tour] Load Tours',
  AddTour = '[Tour] Add Tour',
  // UpsertTour = '[Tour] Upsert Tour',
  AddTours = '[Tour] Add Tours',
  // UpsertTours = '[Tour] Upsert Tours',
  UpdateTour = '[Tour] Update Tour',
  UpdateTours = '[Tour] Update Tours',
  DeleteTour = '[Tour] Delete Tour',
  DeleteTours = '[Tour] Delete Tours',
  ClearTours = '[Tour] Clear Tours'
}

export class SetSelectedTour implements Action {
  readonly type = TourActionTypes.SetSelectedTour;

  constructor(public payload: { id: number }) {}
}

export class ClearSelectedTour implements Action {
  readonly type = TourActionTypes.ClearSelectedTour;

  constructor() {}
}

export class GetTour implements Action {
  readonly type = TourActionTypes.GetTour;

  constructor(public payload: { id: number }) {}
}

export class GetTours implements Action {
  readonly type = TourActionTypes.GetTours;

  constructor() {}
}

export class GetToursByTournament implements Action {
  readonly type = TourActionTypes.GetToursByTournament;

  constructor(public payload: { id: number }) {}
}

export class LoadTours implements Action {
  readonly type = TourActionTypes.LoadTours;

  constructor(public payload: { tours: ITour[] }) {}
}

export class AddTour implements Action {
  readonly type = TourActionTypes.AddTour;

  constructor(public payload: { tour: ITour }) {}
}
/*
export class UpsertTour implements Action {
  readonly type = TourActionTypes.UpsertTour;

  constructor(public payload: { tour: Update<ITour> }) {}
}
*/
export class AddTours implements Action {
  readonly type = TourActionTypes.AddTours;

  constructor(public payload: { tours: ITour[] }) {}
}
/*
export class UpsertTours implements Action {
  readonly type = TourActionTypes.UpsertTours;

  constructor(public payload: { tours: Update<ITour>[] }) {}
}
*/
export class UpdateTour implements Action {
  readonly type = TourActionTypes.UpdateTour;

  constructor(public payload: { tour: Update<ITour> }) {}
}

export class UpdateTours implements Action {
  readonly type = TourActionTypes.UpdateTours;

  constructor(public payload: { tours: Update<ITour>[] }) {}
}

export class DeleteTour implements Action {
  readonly type = TourActionTypes.DeleteTour;

  constructor(public payload: { id: number }) {}
}

export class DeleteTours implements Action {
  readonly type = TourActionTypes.DeleteTours;

  constructor(public payload: { ids: number[] }) {}
}

export class ClearTours implements Action {
  readonly type = TourActionTypes.ClearTours;
}

export type TourActions =
  SetSelectedTour
 | ClearSelectedTour
 | LoadTours
 | AddTour
 // | UpsertTour
 | AddTours
 // | UpsertTours
 | UpdateTour
 | UpdateTours
 | DeleteTour
 | DeleteTours
 | ClearTours;
