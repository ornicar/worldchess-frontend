import { Action } from '@ngrx/store';
import { IErrorsResponse } from '../../auth/auth.model';
import { IAccount, IAccountRating, FounderStatus } from './account.model';

export enum AccountActionTypes {
  LoadSuccess = '[Account] Account load success',
  LoadRatingSuccess = '[Account] Account load rating success',
  Update = '[Account] Account update request',
  UpdateSuccess = '[Account] Account update success',
  UpdateError = '[Account] Account update error',
  UpdateClear = '[Account] Account update clear errors',
  Delete = '[Account] Account delete request',
  DeleteSuccess = '[Account] Account delete success',
  DeleteError = '[Account] Account delete error',
  DeleteClear = '[Account] Account delete clear errors',
  Refresh = '[Account] Refresh account info',
  CreateFideId = '[Account] Create fide id',
  CreateFideIdSuccess = '[Account] Fide id is created.',
  CreateFideIdError = '[Account] Error occurred then creating fide id.',
  Reset = '[Account] Reset account',
  CancelFounderStatus = '[Account] Cancel founder status',
  RequestFounderStatus = '[Account] Request founder status',
  FounderStatusError = '[Account] Founder status error',
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

export class AccountDelete implements Action {
  readonly type = AccountActionTypes.Delete;

  constructor() {}
}

export class AccountDeleteSuccess implements Action {
  readonly type = AccountActionTypes.DeleteSuccess;

  constructor() {}
}

export class AccountDeleteError implements Action {
  readonly type = AccountActionTypes.DeleteError;

  constructor(public payload: { errors: IErrorsResponse }) {}
}

export class AccountDeleteClear implements Action {
  readonly type = AccountActionTypes.DeleteClear;

  constructor() {}
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

export class CancelFounderStatus implements Action {
  readonly type = AccountActionTypes.CancelFounderStatus;

  constructor() {}
}

export class RequestFounderStatus implements Action {
  readonly type = AccountActionTypes.RequestFounderStatus;

  constructor() {}
}

export class FounderStatusError implements Action {
  readonly type = AccountActionTypes.FounderStatusError;

  constructor(public payload: { errorMessage: string }) {}
}

export type AccountActions =
  AccountLoadSuccess
  | AccountLoadRatingSuccess
  | AccountUpdate
  | AccountUpdateSuccess
  | AccountUpdateError
  | AccountUpdateClear
  | AccountDelete
  | AccountDeleteSuccess
  | AccountDeleteError
  | AccountDeleteClear
  | CreateFideId
  | CreateFideIdSuccess
  | CreateFideIdError
  | AccountReset
  | CancelFounderStatus
  | RequestFounderStatus
  | FounderStatusError;

