import { Action } from '@ngrx/store';
import {mainBanner, miniBanner} from './main-page.reducer';

export enum MainPageActionsTypes {
  GetInfo = '[MainPage] Get main page info request',
  SetInfo = '[MainPage] Set main page info to store',
  GetInfoError = '[MainPage] Main page get info error',
}

export class MainPageGetInfo implements Action {
  readonly type = MainPageActionsTypes.GetInfo;

  constructor() {}
}

export class MainPageSetInfo implements Action {
  readonly type = MainPageActionsTypes.SetInfo;

  constructor(public payload: {
    banner: mainBanner;
    mini_banner_1: miniBanner;
    mini_banner_2: miniBanner;
    mini_banner_3: miniBanner;
  }) {}
}

export class MainPageGetInfoError implements Action {
  readonly type = MainPageActionsTypes.GetInfoError;

  constructor(public  payload: { error }) {}
}

export type MainPageActions =
  MainPageGetInfo
  | MainPageSetInfo
  | MainPageGetInfoError
  ;
