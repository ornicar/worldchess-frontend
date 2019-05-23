import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccountActions, AccountActionTypes, AccountReset } from './account.actions';
import {IAccount, FounderStatus, IAccountRating} from './account.model';


export interface State {
  account: IAccount;
  rating: IAccountRating;
  accountUpdate: {
    loading: boolean,
    errors: {
      email?: string,
      full_name?: string,
      non_field_errors?: string
    }
  };
  wannaBeOrgModalOpened: boolean;
  fideId: number;
  fideIdErrorMsg: string;
}

export const initialState: State = {
  account: null,
  rating: null,
  accountUpdate: {
    loading: false,
    errors: {}
  },
  wannaBeOrgModalOpened: false,
  fideId: null,
  fideIdErrorMsg: null,
};

const getErrorsMessages = (fields, errors) => {

  return fields.reduce(
    (accumulator, field) => {
      if (errors[field]) {
        accumulator[field] = errors[field][0];
      }

      return accumulator;
    },
    {}
  );
};

export function reducer(state = initialState, action: AccountActions): State {
  switch (action.type) {

    case AccountActionTypes.LoadSuccess:
      return state = {
        ...state,
        account: action.payload.account
      };

    case AccountActionTypes.LoadRatingSuccess:
      return state = {
        ...state,
        rating: action.payload.rating
      };

    case AccountActionTypes.Update:
      return state = {
        ...state,
        accountUpdate: {
          ...state.accountUpdate,
          loading: true
        }
      };

    case AccountActionTypes.UpdateSuccess:
      return state = {
        account: {
          ...state.account,
          ...action.payload.account
        },
        rating: state.rating,
        accountUpdate: {
          loading: false,
          errors: {}
        },
        wannaBeOrgModalOpened: state.wannaBeOrgModalOpened,
        fideId: state.fideId,
        fideIdErrorMsg: state.fideIdErrorMsg,
      };

    case AccountActionTypes.UpdateError:
      return state = {
        ...state,
        accountUpdate: {
          loading: false,
          errors: getErrorsMessages(['email', 'password', 'non_field_errors'], action.payload.errors)
        }
      };

    case AccountActionTypes.UpdateClear:
      return state = {
        ...state,
        accountUpdate: {
          ...state.accountUpdate,
          errors: {}
        }
      };

    case AccountActionTypes.OpenWannaBeOrgModal:
      return {
        ...state,
        wannaBeOrgModalOpened: true
      };

    case AccountActionTypes.CloseWannaBeOrgModal:
      return {
        ...state,
        wannaBeOrgModalOpened: false
      };

    case AccountActionTypes.CreateFideIdSuccess:
      return {
        ...state,
        fideId: action.payload.fideId,
        fideIdErrorMsg: null,
      };

    case AccountActionTypes.CreateFideIdError:
      return {
        ...state,
        fideIdErrorMsg: action.payload.errorMessage,
      };

    case AccountActionTypes.Reset:
      return {
        ...initialState
      };

    default:
      return state;
  }
}

export const selectAccount = createFeatureSelector<State>('account');

export const selectMyAccount = createSelector(selectAccount, ({ account }) => account);

export const selectMyAccountRating = createSelector(selectAccount, ({ rating }) => rating);

export const selectFideId = createSelector(selectAccount, ({ fideId }) => fideId);

export const selectFideIdErrorMsg = createSelector(selectAccount, ({ fideIdErrorMsg }) => fideIdErrorMsg);

export const selectMyAccountUpdateLoading = createSelector(selectAccount, ({ accountUpdate: { loading } }) => loading);

export const  selectMyAccountUpdateErrors = createSelector(selectAccount, ({ accountUpdate: { errors } }) => errors);

export const selectCanUserCreateEvent = createSelector(selectMyAccount, (account) => account ?
  account.founder_approve_status === FounderStatus.APPROVE : false);

export const selectMyAccountId = createSelector(selectAccount, ({ account }) => account ? account.id : null);

export const selectWannBeOrgModalIsOpened = createSelector(selectAccount, (account) => account.wannaBeOrgModalOpened);
