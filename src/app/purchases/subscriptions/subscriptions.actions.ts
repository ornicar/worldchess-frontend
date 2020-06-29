import {Action} from '@ngrx/store';
import { ISubscription } from './subscriptions.model';
import { Update } from '@ngrx/entity';
import { IPaginationParams } from '../../broadcast/chess-footer/team-players/team-players-resource.service';
import { UpdateStr } from '@ngrx/entity/src/models';


export enum SubscriptionActionTypes {
  GetSubscriptions = '[Subscription] Get all Subscriptions',
  LoadSubscription = '[Subscription] Load Subscriptions',
  AddSubscription = '[Subscription] Add Subscription',
  AddSubscriptions = '[Subscription] Add Subscriptions',
  UpdateSubscription = '[Subscription] Update Subscription',
  UpdateSubscriptions = '[Subscription] Update Subscriptions',
  DeleteSubscription = '[Subscription] Delete Subscription',
  DeleteSubscriptions = '[Subscription] Delete Subscriptions',
  ClearSubscriptions = '[Subscription] Clear Subscriptions',
  OpenCancelRenewDialog = '[Subscription] Open cancel renew subscription dialog',
  CloseCancelRenewDialog = '[Subscription] Close cancel renew subscription dialog',
  CancelRenewSubscription = '[Subscription] Cancel renew subscription',
  ReactivateSubscription = '[Subscription] Reactivate subscription'
}

export class GetSubscriptions implements Action {
  readonly type = SubscriptionActionTypes.GetSubscriptions;

  constructor(public payload: { params: IPaginationParams }) {}
}

export class LoadSubscription implements Action {
  readonly type = SubscriptionActionTypes.LoadSubscription;

  constructor(public payload: { subscription: ISubscription }) {}
}

export class AddSubscription implements Action {
  readonly type = SubscriptionActionTypes.AddSubscription;

  constructor(public payload: { subscription: ISubscription }) {}
}

export class AddSubscriptions implements Action {
  readonly type = SubscriptionActionTypes.AddSubscriptions;

  constructor(public payload: { subscriptions: ISubscription[], count: number }) {}
}

export class UpdateSubscription implements Action {
  readonly type = SubscriptionActionTypes.UpdateSubscription;

  constructor(public payload: { subscription: UpdateStr<ISubscription> }) {}
}

export class UpdateSubscriptions implements Action {
  readonly type = SubscriptionActionTypes.UpdateSubscriptions;

  constructor(public payload: { subscriptions: Update<ISubscription>[] }) {}
}

export class DeleteSubscription implements Action {
  readonly type = SubscriptionActionTypes.DeleteSubscription;

  constructor(public payload: { id: number }) {}
}

export class DeleteSubscriptions implements Action {
  readonly type = SubscriptionActionTypes.DeleteSubscriptions;

  constructor(public payload: { ids: number[] }) {}
}

export class ClearSubscriptions implements Action {
  readonly type = SubscriptionActionTypes.ClearSubscriptions;
}

export class OpenCancelRenewDialog implements Action {
  readonly type = SubscriptionActionTypes.OpenCancelRenewDialog;
}

export class CloseCancelRenewDialog implements Action {
  readonly type = SubscriptionActionTypes.CloseCancelRenewDialog;
}

export class CancelRenewSubscription implements Action {
  readonly type = SubscriptionActionTypes.CancelRenewSubscription;

  constructor(public payload: { stripe_id: string, notify: boolean }) {}
}

export class ReactivateSubscription implements Action {
  readonly type = SubscriptionActionTypes.ReactivateSubscription;

  constructor(public payload: { stripe_id: string, notify: boolean }) {}
}

export type SubscriptionActions =
GetSubscriptions
 | LoadSubscription
 | AddSubscription
 | AddSubscriptions
 | UpdateSubscription
 | UpdateSubscriptions
 | DeleteSubscription
 | DeleteSubscriptions
 | ClearSubscriptions
 | OpenCancelRenewDialog
 | CloseCancelRenewDialog
 | CancelRenewSubscription
 | ReactivateSubscription;
