import {Action} from '@ngrx/store';
import {IPlayerRating} from './player-rating.model';

export enum PlayerRatingActionTypes {
  GetRatings = '[PlayerRating] Get all Players Ratings',
  LoadRatings = '[PlayerRating] Load Players Ratings',
  AddRatings = '[PlayerRating] Add Players Ratings',
  ClearRatings = '[PlayerRating] Clear Players Ratings'
}

export class GetRatings implements Action {
  readonly type = PlayerRatingActionTypes.GetRatings;

  constructor() {}
}

export class LoadRatings implements Action {
  readonly type = PlayerRatingActionTypes.LoadRatings;

  constructor(public payload: {playerRatings: IPlayerRating[]}) {}
}

export class AddRatings implements Action {
  readonly type = PlayerRatingActionTypes.AddRatings;

  constructor(public payload: {playerRatings: IPlayerRating[]}) {}
}

export class ClearRatings implements Action {
  readonly type = PlayerRatingActionTypes.ClearRatings;
}

export type PlayerRatingActions =
  | AddRatings
  | LoadRatings
  | GetRatings
  | ClearRatings;
