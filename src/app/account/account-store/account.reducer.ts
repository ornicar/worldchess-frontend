import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccountActions, AccountActionTypes } from './account.actions';
import { IAccount, FounderStatus, IAccountRating, IFriend, AccountVerification } from './account.model';


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
  accountDelete: {
    loading: boolean,
    errors: {
      email?: string,
      full_name?: string,
      non_field_errors?: string
    }
  };
  fideId: number;
  fideIdErrorMsg: string;
  founderStatusErrorMsg?: string;
  friendList?: IFriend[];
}

export const initialState: State = {
  account: null,
  rating: null,
  accountUpdate: {
    loading: false,
    errors: {}
  },
  accountDelete: {
    loading: false,
    errors: {}
  },
  fideId: null,
  fideIdErrorMsg: null,
  founderStatusErrorMsg: null,
  friendList: null
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
        accountDelete: {
          loading: false,
          errors: {}
        },
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

    case AccountActionTypes.Delete:
      return state = {
        ...state,
        accountDelete: {
          ...state.accountDelete,
          loading: true
        }
      };

    case AccountActionTypes.DeleteSuccess:
      return state = {
        ...state,
        accountDelete: {
          loading: false,
          errors: {}
        },
      };

    case AccountActionTypes.DeleteError:
      return state = {
        ...state,
        accountDelete: {
          loading: false,
          errors: getErrorsMessages(['email', 'password', 'non_field_errors'], action.payload.errors)
        }
      };

    case AccountActionTypes.DeleteClear:
      return state = {
        ...state,
        accountDelete: {
          loading: false,
          errors: {}
        }
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

    case AccountActionTypes.FounderStatusError:
      const { errorMessage: founderStatusErrorMsg } = action.payload;

      return {
        ...state,
        founderStatusErrorMsg,
      };

    default:
      return state;
  }
}

export const selectAccount = createFeatureSelector<State>('account');

export const selectMyAccount = createSelector(selectAccount, ({ account }) => account);

export const selectIsFideVerifiedUser = createSelector(
  selectAccount,
  ({ account }) => account.fide_id && account.fide_verified_status === AccountVerification.VERIFIED
);

export const selectMyAccountDelete = createSelector(selectAccount, ({ accountDelete: { errors } }) => errors);

export const selectMyAccountRating = createSelector(selectAccount, ({ rating }) => rating);

export const selectMyAccountUpdateLoading = createSelector(selectAccount, ({ accountUpdate: { loading } }) => loading);

export const selectMyAccountUpdateErrors = createSelector(selectAccount, ({ accountUpdate: { errors } }) => errors);

export const selectMyAccountFriendList = createSelector(selectAccount, ({ friendList }) => friendList);

export const selectCanUserCreateEvent = createSelector(selectMyAccount, (account) => account ?
  account.founder_approve_status === FounderStatus.APPROVE : false);

