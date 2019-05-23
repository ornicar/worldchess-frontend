import {createFeatureSelector, createSelector} from '@ngrx/store';
import {SubscriptionActions, SubscriptionActionTypes} from './subscriptions.actions';
import {ISubscription} from './subscriptions.model';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';

export interface State extends EntityState<ISubscription> {
  dialogOpened: boolean;
  count: number;
}
export const adapter: EntityAdapter<ISubscription> = createEntityAdapter<ISubscription>({
  selectId: subscription => subscription.stripe_id
});

export const initialState: State = adapter.getInitialState({
  dialogOpened: false,
  count: 0
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
      return adapter.updateOne(action.payload.subscription, state);
    }

    case SubscriptionActionTypes.OpenCancelRenewDialog: {
      return {
        ...state,
        dialogOpened: true
      };
    }

    case SubscriptionActionTypes.CloseCancelRenewDialog: {
      return {
        ...state,
        dialogOpened: false
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

export const selectCancelRenewDialogIsOpened = createSelector(selectSubscriptionStore, (store) => store.dialogOpened);
