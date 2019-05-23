import { Action } from '@ngrx/store';
import { IErrorsResponse } from '../../auth/auth.model';
import {IAccount, IAccountRating} from './account.model';

export enum AccountActionTypes {
  LoadSuccess = '[Account] Account load success',
  LoadRatingSuccess = '[Account] Account load rating success',
  Update = '[Account] Account update request',
  UpdateSuccess = '[Account] Account update success',
  UpdateError = '[Account] Account update error',
  UpdateClear = '[Account] Account update clear errors',
  Refresh = '[Account] Refresh account info',
  OpenWannaBeOrgModal = '[Account] Open wanna be organizer modal',
  CloseWannaBeOrgModal = '[Account] Close wanna be organizer modal',
  CreateFideId = '[Account] Create fide id',
  CreateFideIdSuccess = '[Account] Fide id is created.',
  CreateFideIdError = '[Account] Error occurred then creating fide id.',
  Reset = '[Account] Reset account',
}

export class AccountLoadSuccess implements Action {
  readonly type = AccountActionTypes.LoadSuccess;

  constructor(public payload: { account: IAccount }) {}
}

export class AccountLoadRatingSuccess implements Action {
  readonly type = AccountActionTypes.LoadRatingSuccess;

  constructor(public payload: { rating: IAccountRating }) {}
}

export class AccountUpdate implements Action {
  readonly type = AccountActionTypes.Update;

  constructor(public payload: { account: Partial<IAccount> }) {}
}

export class AccountUpdateSuccess implements Action {
  readonly type = AccountActionTypes.UpdateSuccess;

  constructor(public payload: { account: IAccount }) {}
}

export class AccountRefresh implements Action {
  readonly type = AccountActionTypes.Refresh;
}

export class AccountUpdateError implements Action {
  readonly type = AccountActionTypes.UpdateError;

  constructor(public payload: { errors: IErrorsResponse }) {}
}

export class AccountUpdateClear implements Action {
  readonly type = AccountActionTypes.UpdateClear;

  constructor() {}
}

export class OpenWannaBeOrgModal implements Action {
  readonly type = AccountActionTypes.OpenWannaBeOrgModal;

  constructor() {}
}

export class CloseWannaBeOrgModal implements Action {
  readonly type = AccountActionTypes.CloseWannaBeOrgModal;

  constructor() {}
}

export class CreateFideId implements Action {
  readonly type = AccountActionTypes.CreateFideId;
}

export class CreateFideIdSuccess implements Action {
  readonly type = AccountActionTypes.CreateFideIdSuccess;

  constructor(public payload: { fideId: number }) {}
}

export class CreateFideIdError implements Action {
  readonly type = AccountActionTypes.CreateFideIdError;

  constructor(public payload: { errorMessage: string }) {}
}

export class AccountReset implements Action {
  readonly type = AccountActionTypes.Reset;

  constructor() {}
}

export type AccountActions =
  AccountLoadSuccess
  | AccountLoadRatingSuccess
  | AccountUpdate
  | AccountUpdateSuccess
  | AccountUpdateError
  | AccountUpdateClear
  | OpenWannaBeOrgModal
  | CloseWannaBeOrgModal
  | CreateFideId
  | CreateFideIdSuccess
  | CreateFideIdError
  | AccountReset;
