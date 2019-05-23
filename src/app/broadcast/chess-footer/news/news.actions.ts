import {Action} from '@ngrx/store';
import {INews} from './news.model';

export enum NewsActionTypes {
  GetNewss = '[News] Get Newss',
  LoadNewss = '[News] Load Newss',
}

export class LoadNewss implements Action {
  readonly type = NewsActionTypes.LoadNewss;

  constructor(public payload: { newss: INews[] }) {}
}

export class GetNewss implements Action {
  readonly type = NewsActionTypes.GetNewss;

  constructor() {}
}

export type NewsActions = LoadNewss | GetNewss;
