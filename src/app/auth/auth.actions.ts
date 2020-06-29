import { Action } from '@ngrx/store';
import {
  IActivateCredential,
  IErrorsResponse,
  INewPasswordCredential,
  IPasswordResetCredential,
  ISignInCredential,
  ISignUpCredential,
  TwitterOAuthCredentials,
} from './auth.model';


export enum AuthActionTypes {
  Init = '[Auth] After read cookie and init token',
  SignIn = '[Auth] Sign in request',
  SignInFacebook = '[Auth] Sign in facebook',
  SignInTwitter = '[Auth] Sign in twitter',
  SignInSuccess = '[Auth] Sign in success',
  SignInSocialSuccess = '[Auth] Sign in social success',
  SignInError = '[Auth] Sign in error',
  SignInClearError = '[Auth] Sign in clear error',
  SignUp = '[Auth] Sign up request',
  SignUpSuccess = '[Auth] Sign up success',
  SignUpSuccessClear = '[Auth] Sign up success clear',
  SignUpError = '[Auth] Sign up error',
  SignUpClearError = '[Auth] Sign up clear error',
  Activate = '[Auth] Activate request',
  ActivateSuccess = '[Auth] Activate success',
  ActivateError = '[Auth] Activate error',
  ActivateClear = '[Auth] Activate clear error',
  PasswordReset = '[Auth] Password reset request',
  PasswordResetSuccess = '[Auth] Password reset success',
  PasswordResetError = '[Auth] Password reset error',
  PasswordResetClear = '[Auth] Password reset clear state',
  NewPassword = '[Auth] New password request',
  NewPasswordSuccess = '[Auth] New password success',
  NewPasswordError = '[Auth] New password error',
  NewPasswordClear = '[Auth] New password clear state',
  SetSocketReconnectingFlag = '[Auth] Set token reconnecting flag',
  Logout = '[Auth] Logout',
  GetUid = '[Auth] Get UID',
  GetUidSuccess = '[Auth] Get UID success',
  GetUidError = '[Auth] Get UID error',
  RefreshToken = '[Auth] Refresh current token',
  RefreshCurrentToken = '[Auth] Refresh current token from store',
  RefreshTokenSuccess = '[Auth] Refresh token success',
  RefreshTokenError = '[Auth] Refresh token error',
  SetToken = '[Auth] Set token',
  SetTokenDirty = '[Auth] Set token without effects',
  ClearToken = '[Auth] Clear token',
}

export class AuthInit implements Action {
  readonly type = AuthActionTypes.Init;

  constructor() {}
}

export class AuthSignIn implements Action {
  readonly type = AuthActionTypes.SignIn;

  constructor(public payload: { credential: ISignInCredential }) {}
}

export class AuthSignInFacebook implements Action {
  readonly type = AuthActionTypes.SignInFacebook;

  constructor(public payload: { code: string }) {}
}

export class AuthSignInTwitter implements Action {
  readonly type = AuthActionTypes.SignInTwitter;

  constructor(public payload: { credentials: TwitterOAuthCredentials }) {}
}

export class AuthSignInSuccess implements Action {
  readonly type = AuthActionTypes.SignInSuccess;

  constructor(public payload: { token: string }) {}
}

export class AuthSignInSocialSuccess implements Action {
  readonly type = AuthActionTypes.SignInSocialSuccess;

  constructor() {}
}

export class AuthSignInError implements Action {
  readonly type = AuthActionTypes.SignInError;

  constructor(public payload: { errors: IErrorsResponse, passwordBeenReset: boolean }) {}
}

export class AuthSignInClearError implements Action {
  readonly type = AuthActionTypes.SignInClearError;

  constructor() {}
}

export class AuthSignUp implements Action {
  readonly type = AuthActionTypes.SignUp;

  constructor(public payload: { credential: ISignUpCredential, redirect?: string | boolean }) {}
}

export class AuthSignUpSuccess implements Action {
  readonly type = AuthActionTypes.SignUpSuccess;

  constructor(public payload: { token: string, redirect?: boolean | string }) {}
}

export class AuthSignUpSuccessClear implements Action {
  readonly type = AuthActionTypes.SignUpSuccessClear;

  constructor() {}
}

export class AuthSignUpError implements Action {
  readonly type = AuthActionTypes.SignUpError;

  constructor(public payload: { errors: IErrorsResponse }) {}
}

export class AuthSignUpClearError implements Action {
  readonly type = AuthActionTypes.SignUpClearError;

  constructor() {}
}

export class AuthActivate implements Action {
  readonly type = AuthActionTypes.Activate;

  constructor(public payload: { credential: IActivateCredential }) {}
}

export class AuthActivateSuccess implements Action {
  readonly type = AuthActionTypes.ActivateSuccess;

  constructor(public payload: { token: string }) {}
}

export class AuthActivateError implements Action {
  readonly type = AuthActionTypes.ActivateError;

  constructor(public payload: { errors: IErrorsResponse }) {}
}

export class AuthActivateClear implements Action {
  readonly type = AuthActionTypes.ActivateClear;

  constructor() {}
}

export class AuthPasswordReset implements Action {
  readonly type = AuthActionTypes.PasswordReset;

  constructor(public payload: { credential: IPasswordResetCredential }) {}
}

export class AuthPasswordResetSuccess implements Action {
  readonly type = AuthActionTypes.PasswordResetSuccess;

  constructor() {}
}

export class AuthPasswordResetError implements Action {
  readonly type = AuthActionTypes.PasswordResetError;

  constructor(public payload: { errors: IErrorsResponse }) {}
}

export class AuthPasswordResetClear implements Action {
  readonly type = AuthActionTypes.PasswordResetClear;

  constructor() {}
}

export class AuthNewPassword implements Action {
  readonly type = AuthActionTypes.NewPassword;

  constructor(public payload: { credential: INewPasswordCredential }) {}
}

export class AuthNewPasswordSuccess implements Action {
  readonly type = AuthActionTypes.NewPasswordSuccess;

  constructor() {}
}

export class AuthNewPasswordError implements Action {
  readonly type = AuthActionTypes.NewPasswordError;

  constructor(public payload: { errors: IErrorsResponse }) {}
}

export class AuthNewPasswordClear implements Action {
  readonly type = AuthActionTypes.NewPasswordClear;

  constructor() {}
}

export class AuthLogout implements Action {
  readonly type = AuthActionTypes.Logout;

  constructor() {}
}

export class AuthGetUid implements Action {
  readonly type = AuthActionTypes.GetUid;

  constructor(public payload: {needSetCookie: boolean}) {}
}

export class AuthSetSocketReconnectingFlag implements Action {
  readonly type = AuthActionTypes.SetSocketReconnectingFlag;

  constructor(public payload: {flag: boolean}) {}
}

export class AuthGetUidSuccess implements Action {
  readonly type = AuthActionTypes.GetUidSuccess;

  constructor(public payload: { uid: string }) {}
}

export class AuthGetUidError implements Action {
  readonly type = AuthActionTypes.GetUidError;

  constructor() {}
}

export class AuthRefreshToken implements Action {
  readonly type = AuthActionTypes.RefreshToken;

  constructor(public payload: { token: string, isInit?: boolean, force?: boolean }) {}
}

export class AuthRefreshCurrentToken implements Action {
  readonly type = AuthActionTypes.RefreshCurrentToken;

  constructor() {}
}

export class AuthRefreshTokenSuccess implements Action {
  readonly type = AuthActionTypes.RefreshTokenSuccess;

  constructor(public payload: { token: string }) {}
}

export class AuthRefreshTokenError implements Action {
  readonly type = AuthActionTypes.RefreshTokenError;

  constructor() {}
}

export class AuthSetToken implements Action {
  readonly type = AuthActionTypes.SetToken;

  constructor(public payload: { token: string }) {}
}

export class AuthClearToken implements Action {
  readonly type = AuthActionTypes.ClearToken;

  constructor() {}
}

export class AuthSetTokenDirty implements Action {
  readonly type = AuthActionTypes.SetTokenDirty;

  constructor(public payload: { token: string }) {}
}

export type AuthActions =
  AuthInit
  | AuthSignIn
  | AuthSignInFacebook
  | AuthSignInTwitter
  | AuthSignInSuccess
  | AuthSignInSocialSuccess
  | AuthSignInError
  | AuthSignInClearError
  | AuthSignUp
  | AuthSignUpSuccess
  | AuthSignUpSuccessClear
  | AuthSignUpError
  | AuthSignUpClearError
  | AuthActivate
  | AuthActivateSuccess
  | AuthActivateError
  | AuthActivateClear
  | AuthPasswordReset
  | AuthPasswordResetSuccess
  | AuthPasswordResetError
  | AuthPasswordResetClear
  | AuthNewPassword
  | AuthNewPasswordSuccess
  | AuthNewPasswordError
  | AuthNewPasswordClear
  | AuthLogout
  | AuthGetUid
  | AuthGetUidSuccess
  | AuthGetUidError
  | AuthSetSocketReconnectingFlag
  | AuthRefreshToken
  | AuthRefreshCurrentToken
  | AuthRefreshTokenSuccess
  | AuthRefreshTokenError
  | AuthSetToken
  | AuthClearToken
  | AuthSetTokenDirty;
