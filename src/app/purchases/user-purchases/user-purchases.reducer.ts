import {createFeatureSelector, createSelector} from '@ngrx/store';
import {UserPurchaseActions, UserPurchaseActionTypes} from './user-purchases.actions';
import {IUserPurchase} from './user-purchases.model';

export interface State {
  userPurchase?: IUserPurchase;
}

export const initialState: State = {
  userPurchase: null
};

export function reducer(
  state = initialState,
  action: UserPurchaseActions
): State {
  switch (action.type) {
    case UserPurchaseActionTypes.LoadUserPurchase: {
      const { userPurchase } = action.payload;
      return {...state, userPurchase };
    }

    case UserPurchaseActionTypes.ClearUserPurchases: {
      return {...state, userPurchase: null };
    }
    default: {
      return state;
    }
  }
}

export const selectUserPurchaseStore = createFeatureSelector<State>('user-purchase');

export const selectUserPurchase = createSelector(selectUserPurchaseStore, ({ userPurchase }) => userPurchase);
