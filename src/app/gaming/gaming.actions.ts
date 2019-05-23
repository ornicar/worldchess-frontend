import {Action} from '@ngrx/store';

export enum GamingActionTypes {
  ReadyPlay = '[Gaming] Player ready for play game'
}

export class GamingReadyPlay implements Action {
  readonly type = GamingActionTypes.ReadyPlay;

  constructor(public payload: {board_id: number}) {}
}

export type GamingActions = GamingReadyPlay;
