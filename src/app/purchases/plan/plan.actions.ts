import {Action} from '@ngrx/store';
import { IPlan } from './plan.model';
import { Update } from '@ngrx/entity';


export enum PlanActionTypes {
  GetPlans = '[Plan] Get all Plans',
  LoadPlans = '[Plan] Load Plans',
  AddPlan = '[Plan] Add Plan',
  // UpsertPlan = '[Plan] Upsert Plan',
  AddPlans = '[Plan] Add Plans',
  // UpsertPlans = '[Plan] Upsert Plans',
  UpdatePlan = '[Plan] Update Plan',
  UpdatePlans = '[Plan] Update Plans',
  DeletePlan = '[Plan] Delete Plan',
  DeletePlans = '[Plan] Delete Plans',
  ClearPlans = '[Plan] Clear Plans'
}

export class GetPlans implements Action {
  readonly type = PlanActionTypes.GetPlans;

  constructor() {}
}

export class LoadPlans implements Action {
  readonly type = PlanActionTypes.LoadPlans;

  constructor(public payload: { plans: IPlan[] }) {}
}

export class AddPlan implements Action {
  readonly type = PlanActionTypes.AddPlan;

  constructor(public payload: { plan: IPlan }) {}
}

export class AddPlans implements Action {
  readonly type = PlanActionTypes.AddPlans;

  constructor(public payload: { plans: IPlan[] }) {}
}

export class UpdatePlan implements Action {
  readonly type = PlanActionTypes.UpdatePlan;

  constructor(public payload: { plan: Update<IPlan> }) {}
}

export class UpdatePlans implements Action {
  readonly type = PlanActionTypes.UpdatePlans;

  constructor(public payload: { plans: Update<IPlan>[] }) {}
}

export class DeletePlan implements Action {
  readonly type = PlanActionTypes.DeletePlan;

  constructor(public payload: { id: number }) {}
}

export class DeletePlans implements Action {
  readonly type = PlanActionTypes.DeletePlans;

  constructor(public payload: { ids: number[] }) {}
}

export class ClearPlans implements Action {
  readonly type = PlanActionTypes.ClearPlans;
}

export type PlanActions =
 LoadPlans
 | AddPlan
 | AddPlans
 | UpdatePlan
 | UpdatePlans
 | DeletePlan
 | DeletePlans
 | ClearPlans;
