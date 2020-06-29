import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { SubscriptionActions, SubscriptionActionTypes } from './subscriptions.actions';
import { ISubscription } from './subscriptions.model';
import { environment } from '../../../environments/environment';

const PRO_PLAN = environment.pro_plan_stripe_id;
const PREMIUM_PLAN = environment.premium_plan_stripe_id;
const FIDE_PLAN = environment.fide_id_plan_stripe_id;

export interface State extends EntityState<ISubscription> {
  dialogOpened: boolean;
  count: number;
  isFideCancelRenewInProgress: boolean;
  isProCancelRenewInProgress: boolean;
}
export const adapter: EntityAdapter<ISubscription> = createEntityAdapter<ISubscription>({
  selectId: subscription => subscription.stripe_id
});

export const initialState: State = adapter.getInitialState({
  dialogOpened: false,
  count: 0,
  isFideCancelRenewInProgress: false,
  isProCancelRenewInProgress: false
});

export function reducer(
  state = initialState,
  action: SubscriptionActions
): State {
  switch (action.type) {
    case SubscriptionActionTypes.AddSubscriptions: {
      const { subscriptions, count } = action.payload;
      const newState = {
        ...state,
        count
      };
      return adapter.addMany(subscriptions, newState);
    }

    case SubscriptionActionTypes.ClearSubscriptions: {
      const newState = {
        ...state,
        count: 0
      };
      return adapter.removeAll(newState);
    }

    case SubscriptionActionTypes.UpdateSubscription: {
      return {
        ...adapter.updateOne(action.payload.subscription, state),
        isFideCancelRenewInProgress: false,
        isProCancelRenewInProgress: false
      };
    }

    case SubscriptionActionTypes.OpenCancelRenewDialog: {
      return {
        ...state,
        dialogOpened: true,
      };
    }

    case SubscriptionActionTypes.CloseCancelRenewDialog: {
      return {
        ...state,
        dialogOpened: false
      };
    }

    case SubscriptionActionTypes.CancelRenewSubscription: {
      return {
        ...state,
        isFideCancelRenewInProgress: state.entities[action.payload.stripe_id].plan.stripe_id === FIDE_PLAN
          ? true
          : state.isFideCancelRenewInProgress,
        isProCancelRenewInProgress: state.entities[action.payload.stripe_id].plan.stripe_id === PRO_PLAN
          ? true
          : state.isProCancelRenewInProgress
      };
    }

    case SubscriptionActionTypes.ReactivateSubscription: {
      return {
        ...state,
        isFideCancelRenewInProgress: state.entities[action.payload.stripe_id].plan.stripe_id === FIDE_PLAN
          ? true
          : state.isFideCancelRenewInProgress,
        isProCancelRenewInProgress: state.entities[action.payload.stripe_id].plan.stripe_id === PRO_PLAN
          ? true
          : state.isProCancelRenewInProgress
      };
    }
    default: {
      return state;
    }
  }
}

export const selectSubscriptionStore = createFeatureSelector<State>('subscription');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectSubscriptionStore);

export const selectFideCancelRenewInProgress = createSelector(selectSubscriptionStore, (store) => store.isFideCancelRenewInProgress);
export const selectProCancelRenewInProgress = createSelector(selectSubscriptionStore, (store) => store.isProCancelRenewInProgress);
export const selectActivePlanSubscription = createSelector(selectAll, (subscriptions: ISubscription[]) => {
  return subscriptions.find(s => s.is_active && [PRO_PLAN, PREMIUM_PLAN].indexOf(s.plan.stripe_id) !== -1);
});
export const selectProPlan = createSelector(selectAll, (subscriptions: ISubscription[]) => {
  return subscriptions.find(s => s.plan.stripe_id === PRO_PLAN);
});
export const selectPremiumPlan = createSelector(selectAll, (subscriptions: ISubscription[]) => {
  return subscriptions.find(s => s.plan.stripe_id === PREMIUM_PLAN);
});
export const selectFideIdPlan = createSelector(selectAll, (subscriptions: ISubscription[]) => {
  return subscriptions.find(s => s.plan.stripe_id === FIDE_PLAN) || {} as ISubscription;
});
