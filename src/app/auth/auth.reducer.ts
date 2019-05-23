import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ThrowReporter } from 'io-ts/lib/ThrowReporter';
import * as jwtDecode from 'jwt-decode';
import { AuthActions, AuthActionTypes } from './auth.actions';
import { IProfile, ITokenData, TokenData } from './auth.model';

export interface State {
  init: boolean;
  uid: string;
  token: string;
  isAuthorized: boolean;
  profile: IProfile;
  signIn: {
    loading: boolean,
    passwordBeenReset: boolean,
    errors: {
      email?: string,
      password?: string,
      non_field_errors?: string
    };
  };
  signUp: {
    loading: boolean,
    success: boolean,
    errors: {
      email?: string,
      password?: string,
      full_name?: string
      non_field_errors?: string
    };
  };
  activate: {
    loading: boolean,
    success: boolean,
    errors: {
      detail?: string,
    };
  };
  passwordReset: {
    loading: boolean,
    success: boolean,
    errors: {
      email?: string
    };
  };
  newPassword: {
    loading: boolean,
    success: boolean,
    errors: {
      uid?: string
      new_password?: string
    };
  };
  getUid: {
    loading: boolean;
  };
  refresh: {
    loading: boolean;
  };
}

export const initialState: State = {
  init: false,
  uid: null,
  token: undefined,
  isAuthorized: false,
  profile: null,
  signIn: {
    loading: false,
    passwordBeenReset: false,
    errors: {},
  },
  signUp: {
    loading: false,
    success: false,
    errors: {},
  },
  activate: {
    loading: false,
    success: false,
    errors: {},
  },
  passwordReset: {
    loading: false,
    success: false,
    errors: {},
  },
  newPassword: {
    loading: false,
    success: false,
    errors: {},
  },
  getUid: {
    loading: false,
  },
  refresh: {
    loading: false
  }
};

export const decodeToken = (token: string): ITokenData => {
  const tokenDataValidation = TokenData.decode(jwtDecode(token));

  if (tokenDataValidation._tag === 'Left') {
    console.error(jwtDecode(token));
  }

  // Runtime validation data.
  ThrowReporter.report(tokenDataValidation);

  return tokenDataValidation.value as ITokenData;
};

export const tokenTimeLeft = (token: string): number => {
  return decodeToken(token).exp - Math.floor(Date.now() / 1000);
};

export const tokenRefreshTimeLeft = (token: string): number => {
  return decodeToken(token).refresh_exp - Math.floor(Date.now() / 1000);
};

const saveToken = (token: string, state: State): State => {
  const tokenData = decodeToken(token);

  return {
    ...state,
    token: token,
    isAuthorized: true,
    profile: tokenData.profile
  };
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

export function reducer(state = initialState, action: AuthActions): State {
  switch (action.type) {

    case AuthActionTypes.Init:
      return {
        ...state,
        init: true
      };

    case AuthActionTypes.SignIn:
      state = {
        ...state,
        signIn: {
          ...state.signIn,
          loading: true
        }
      };

      return state;

    case AuthActionTypes.SignInFacebook:
      state = {
        ...state,
        signIn: {
          ...state.signIn,
          loading: true
        }
      };

      return state;

    case AuthActionTypes.SignInTwitter:
      state = {
        ...state,
        signIn: {
          ...state.signIn,
          loading: true
        }
      };

      return state;

    case AuthActionTypes.SignInSuccess:
      state = saveToken(action.payload.token, state);

      return {
        ...state,
        signIn: {
          loading: false,
          passwordBeenReset: false,
          errors: {}
        }
      };

    case AuthActionTypes.SignInSocialSuccess:
      return state;

    case AuthActionTypes.SignInError:
      return {
        ...state,
        signIn: {
          loading: false,
          passwordBeenReset: action.payload.passwordBeenReset,
          errors: getErrorsMessages(['email', 'password', 'non_field_errors'], action.payload.errors)
        }
      };

    case AuthActionTypes.SignInClearError:
      return {
        ...state,
        signIn: {
          ...state.signIn,
          passwordBeenReset: false,
          errors: {}
        }
      };

    case AuthActionTypes.SignUp:
      state = {
        ...state,
        signUp: {
          ...state.signUp,
          loading: true
        }
      };

      return state;

    case AuthActionTypes.SignUpSuccess:
      state = saveToken(action.payload.token, state);

      return {
        ...state,
        signUp: {
          loading: false,
          success: true,
          errors: {}
        }
      };

    case AuthActionTypes.SignUpError:
      return {
        ...state,
        signUp: {
          loading: false,
          success: false,
          errors: getErrorsMessages(['email', 'password', 'full_name'], action.payload.errors)
        }
      };

    case AuthActionTypes.SignUpClearError:
      return {
        ...state,
        signUp: {
          ...state.signUp,
          errors: {}
        }
      };

    case AuthActionTypes.Activate:
      state = {
        ...state,
        activate: {
          ...state.activate,
          loading: true
        }
      };

      return state;

    case AuthActionTypes.ActivateSuccess:
      state = saveToken(action.payload.token, state);

      return {
        ...state,
        activate: {
          loading: false,
          success: true,
          errors: {}
        }
      };

    case AuthActionTypes.ActivateError:
      return {
        ...state,
        activate: {
          loading: false,
          success: false,
          errors: getErrorsMessages(['detail'], action.payload.errors)
        }
      };

    case AuthActionTypes.ActivateClear:
      return {
        ...state,
        activate: {
          ...state.activate,
          success: false,
          errors: {}
        }
      };

    case AuthActionTypes.PasswordReset:
      state = {
        ...state,
        passwordReset: {
          ...state.passwordReset,
          loading: true
        }
      };

      return state;

    case AuthActionTypes.PasswordResetSuccess:
      return {
        ...state,
        passwordReset: {
          loading: false,
          success: true,
          errors: {}
        }
      };

    case AuthActionTypes.PasswordResetError:
      return {
        ...state,
        passwordReset: {
          loading: false,
          success: false,
          errors: getErrorsMessages(['email'], action.payload.errors)
        }
      };

    case AuthActionTypes.PasswordResetClear:
      return {
        ...state,
        passwordReset: {
          ...state.passwordReset,
          success: false,
          errors: {}
        }
      };

    case AuthActionTypes.NewPassword:
      state = {
        ...state,
        newPassword: {
          ...state.newPassword,
          loading: true
        }
      };

      return state;

    case AuthActionTypes.NewPasswordSuccess:
      return {
        ...state,
        newPassword: {
          loading: false,
          success: true,
          errors: {}
        }
      };

    case AuthActionTypes.NewPasswordError:
      return {
        ...state,
        newPassword: {
          loading: false,
          success: false,
          errors: getErrorsMessages(['uid', 'new_password'], action.payload.errors)
        }
      };

    case AuthActionTypes.NewPasswordClear:
      return {
        ...state,
        newPassword: {
          ...state.newPassword,
          success: false,
          errors: {}
        }
      };

    case AuthActionTypes.GetUid:
      return {
        ...state,
        uid: null,
        getUid: {
          loading: true
        }
      };

    case AuthActionTypes.GetUidSuccess:

      return {
        ...state,
        uid: action.payload.uid,
        getUid: {
          loading: false
        }
      };

    case AuthActionTypes.GetUidError:
      return {
        ...state,
        uid: null,
        getUid: {
          loading: false
        }
      };

    case AuthActionTypes.RefreshToken:
      return {
        ...state,
        refresh: {
          loading: true
        }
      };

    case AuthActionTypes.RefreshTokenSuccess:
      state = saveToken(action.payload.token, state);

      return {
        ...state,
        refresh: {
          loading: false
        }
      };

    case AuthActionTypes.RefreshTokenError:
      return {
        ...state,
        refresh: {
          loading: false
        }
      };

    case AuthActionTypes.SetToken:
      return saveToken(action.payload.token, state);

    case AuthActionTypes.SetTokenDirty:
    return {
      ...state,
      token: action.payload.token,
    };

    case AuthActionTypes.ClearToken:
      return {
        ...state,
        token: null,
        isAuthorized: false,
        profile: null
      };

    default:
      return state;
  }
}

export const selectAuth = createFeatureSelector<State>('auth');

export const selectIsInit = createSelector(selectAuth, ({init}) => init);

export const selectSignInLoading = createSelector(selectAuth, ({signIn: {loading}}) => loading);

export const selectSignInErrors = createSelector(selectAuth, ({signIn: {errors}}) => errors);

export const selectSignInPasswordBeenReset = createSelector(selectAuth, ({signIn: {passwordBeenReset}}) => passwordBeenReset);

export const selectSignUpLoading = createSelector(selectAuth, ({signUp: {loading}}) => loading);

export const selectSignUpErrors = createSelector(selectAuth, ({signUp: {errors}}) => errors);

export const selectSignUpSuccess = createSelector(selectAuth, ({signUp: {success}}) => success);

export const selectActivateLoading = createSelector(selectAuth, ({activate: {loading}}) => loading);

export const selectActivateSuccess = createSelector(selectAuth, ({activate: {success}}) => success);

export const selectActivateErrors = createSelector(selectAuth, ({activate: {errors}}) => errors);

export const selectPasswordResetLoading = createSelector(selectAuth, ({passwordReset: {loading}}) => loading);

export const selectPasswordResetSuccess = createSelector(selectAuth, ({passwordReset: {success}}) => success);

export const selectPasswordResetErrors = createSelector(selectAuth, ({passwordReset: {errors}}) => errors);

export const selectNewPasswordLoading = createSelector(selectAuth, ({newPassword: {loading}}) => loading);

export const selectNewPasswordSuccess = createSelector(selectAuth, ({newPassword: {success}}) => success);

export const selectNewPasswordErrors = createSelector(selectAuth, ({newPassword: {errors}}) => errors);

export const selectProfile = createSelector(selectAuth, ({profile}) => profile);

export const selectToken = createSelector(selectAuth, ({token}) => token);

export const selectUID = createSelector(selectAuth, ({uid}) => uid);

export const selectIsAuthorized = createSelector(selectAuth, ({isAuthorized}) => isAuthorized);

export const selectRefreshLoading = createSelector(selectAuth, ({refresh: {loading}}) => loading);
