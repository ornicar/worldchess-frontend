import {Action} from '@ngrx/store';
import { ISelling } from './selling.model';
import { Update } from '@ngrx/entity';

export enum SellingActionTypes {
  GetSellings = '[Selling] Get all Sellings',
  LoadSellings = '[Selling] Load Sellings',
  UpdateSelling = '[Selling] Update Selling',
  UpdateSellings = '[Selling] Update Sellings',
  DeleteSelling = '[Selling] Delete Selling',
  DeleteSellings = '[Selling] Delete Sellings',
  ClearSellings = '[Selling] Clear Sellings'
}

export class GetSellings implements Action {
  readonly type = SellingActionTypes.GetSellings;

  constructor() {}
}

export class LoadSellings implements Action {
  readonly type = SellingActionTypes.LoadSellings;

  constructor(public payload: { sellings: ISelling[] }) {}
}

export class UpdateSelling implements Action {
  readonly type = SellingActionTypes.UpdateSelling;

  constructor(public payload: { selling: Update<ISelling> }) {}
}

export class UpdateSellings implements Action {
  readonly type = SellingActionTypes.UpdateSellings;

  constructor(public payload: { sellings: Update<ISelling>[] }) {}
}

export class DeleteSelling implements Action {
  readonly type = SellingActionTypes.DeleteSelling;

  constructor(public payload: { id: number }) {}
}

export class DeleteSellings implements Action {
  readonly type = SellingActionTypes.DeleteSellings;

  constructor(public payload: { ids: number[] }) {}
}

export class ClearSellings implements Action {
  readonly type = SellingActionTypes.ClearSellings;
}

export type SellingActions =
GetSellings
 | LoadSellings
 | UpdateSelling
 | UpdateSellings
 | DeleteSelling
 | DeleteSellings
 | ClearSellings;
