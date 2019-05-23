import {Update} from '@ngrx/entity';
import { Action } from '@ngrx/store';
import {IMovePosition} from '../move/move.model';
import {IVariationMove} from './variation-move.model';

export enum VariationMoveActionTypes {
  ActivateVariationMoves = '[VariationMove] Active variation moves mode',
  DeactivateVariationMoves = '[VariationMove] Deactivate variation moves mode',
  ClearSelectedVariationMove = '[VariationMove] Clear selected variationMove of move',
  SetSelectedVariationMove = '[VariationMove] Set selected variationMove',
  SetVariationMove = '[VariationMove] Set new VariationMove',
  CreateVariationMove = '[VariationMove] Create new VariationMove',
  UpdateVariationMove = '[VariationMove] Update VariationMove'
}

export class ActivateVariationMoves implements Action {
  readonly type = VariationMoveActionTypes.ActivateVariationMoves;

  constructor() {}
}

export class DeactivateVariationMoves implements Action {
  readonly type = VariationMoveActionTypes.DeactivateVariationMoves;

  constructor() {}
}

export class ClearSelectedVariationMove implements Action {
  readonly type = VariationMoveActionTypes.ClearSelectedVariationMove;

  constructor(public payload: { moveId: number }) {}
}

export class SetSelectedVariationMove implements Action {
  readonly type = VariationMoveActionTypes.SetSelectedVariationMove;

  constructor(public payload: { variationMove: IVariationMove }) {}
}

export class SetVariationMove implements Action {
  readonly type = VariationMoveActionTypes.SetVariationMove;

  constructor(public payload: { variationMove: IVariationMove }) {}
}

export class CreateVariationMove implements Action {
  readonly type = VariationMoveActionTypes.CreateVariationMove;

  constructor(public payload: { moveId: number, movePosition: IMovePosition }) {}
}

export class UpdateVariationMove implements Action {
  readonly type = VariationMoveActionTypes.UpdateVariationMove;

  constructor(public payload: { variationMove: Update<IVariationMove> }) {}
}

export type VariationMoveActions =
  ActivateVariationMoves
 | DeactivateVariationMoves
 | ClearSelectedVariationMove
 | SetSelectedVariationMove
 | SetVariationMove
 | CreateVariationMove
 | UpdateVariationMove;
