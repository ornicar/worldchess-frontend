import {Action} from '@ngrx/store';
import { IUserPurchase } from './user-purchases.model';
import { Update } from '@ngrx/entity';


export enum UserPurchaseActionTypes {
  GetUserPurchases = '[UserPurchase] Get all UserPurchases',
  LoadUserPurchase = '[UserPurchase] Load UserPurchases',
  AddUserPurchase = '[UserPurchase] Add UserPurchase',
  // UpsertUserPurchase = '[UserPurchase] Upsert UserPurchase',
  AddUserPurchases = '[UserPurchase] Add UserPurchases',
  // UpsertUserPurchases = '[UserPurchase] Upsert UserPurchases',
  UpdateUserPurchase = '[UserPurchase] Update UserPurchase',
  UpdateUserPurchases = '[UserPurchase] Update UserPurchases',
  DeleteUserPurchase = '[UserPurchase] Delete UserPurchase',
  DeleteUserPurchases = '[UserPurchase] Delete UserPurchases',
  ClearUserPurchases = '[UserPurchase] Clear UserPurchases'
}

export class GetUserPurchases implements Action {
  readonly type = UserPurchaseActionTypes.GetUserPurchases;

  constructor() {}
}

export class LoadUserPurchase implements Action {
  readonly type = UserPurchaseActionTypes.LoadUserPurchase;

  constructor(public payload: { userPurchase: IUserPurchase }) {}
}



// NEEDED ?
export class AddUserPurchase implements Action {
  readonly type = UserPurchaseActionTypes.AddUserPurchase;

  constructor(public payload: { userPurchase: IUserPurchase }) {}
}

export class AddUserPurchases implements Action {
  readonly type = UserPurchaseActionTypes.AddUserPurchases;

  constructor(public payload: { userPurchases: IUserPurchase[] }) {}
}

export class UpdateUserPurchase implements Action {
  readonly type = UserPurchaseActionTypes.UpdateUserPurchase;

  constructor(public payload: { userPurchase: Update<IUserPurchase> }) {}
}

export class UpdateUserPurchases implements Action {
  readonly type = UserPurchaseActionTypes.UpdateUserPurchases;

  constructor(public payload: { userPurchases: Update<IUserPurchase>[] }) {}
}

export class DeleteUserPurchase implements Action {
  readonly type = UserPurchaseActionTypes.DeleteUserPurchase;

  constructor(public payload: { id: number }) {}
}

export class DeleteUserPurchases implements Action {
  readonly type = UserPurchaseActionTypes.DeleteUserPurchases;

  constructor(public payload: { ids: number[] }) {}
}

export class ClearUserPurchases implements Action {
  readonly type = UserPurchaseActionTypes.ClearUserPurchases;
}

export type UserPurchaseActions =
GetUserPurchases
 | LoadUserPurchase
 | AddUserPurchase
 | AddUserPurchases
 | UpdateUserPurchase
 | UpdateUserPurchases
 | DeleteUserPurchase
 | DeleteUserPurchases
 | ClearUserPurchases;
