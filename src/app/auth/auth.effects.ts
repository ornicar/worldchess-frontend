import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { CookieService } from 'ngx-cookie';
import { defer, EMPTY, Observable, of, timer } from 'rxjs';
import { fromArray } from 'rxjs/internal/observable/fromArray';
import { catchError, delay, map, mapTo, mergeMap, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import * as forRoot from '../reducers';
import { AuthResourceService } from './auth-resource.service';
import {
  AuthActionTypes,
  AuthActivate,
  AuthActivateError,
  AuthActivateSuccess,
  AuthClearToken,
  AuthNewPassword,
  AuthNewPasswordError,
  AuthNewPasswordSuccess,
  AuthPasswordReset,
  AuthPasswordResetError,
  AuthPasswordResetSuccess,
  AuthRefreshToken,
  AuthRefreshTokenError,
  AuthRefreshTokenSuccess,
  AuthSetToken,
  AuthSignIn,
  AuthSignInError,
  AuthSignInSuccess,
  AuthSignUp,
  AuthSignUpError,
  AuthSignUpSuccess,
  AuthSignInFacebook,
  AuthSignInTwitter,
  AuthSignInSocialSuccess,
  AuthRefreshCurrentToken,
  AuthLogout,
  AuthGetUid,
  AuthGetUidSuccess,
  AuthGetUidError,
  AuthInit,
  AuthSignUpSuccessClear,
} from './auth.actions';
import { decodeToken, selectToken, tokenRefreshTimeLeft, tokenTimeLeft } from './auth.reducer';
import { IsAuthorizedGuard } from './is-authorized.guard';
import { IsNotAuthorizedGuard } from './is-not-authorized.guard';
import { SocketConnectionService } from './socket-connection.service';
import { ISocketMessage, ISocketSendMessage } from './auth.model';
import { AccountReset } from '@app/account/account-store/account.actions';
import { IsMainApp } from '@app/is-main-app.token';

const TIME_10_MINUTES = 600;
const TIME_1_MINUTE = 60;

@Injectable()
export class AuthEffects {

  private readonly ACCESS_TOKEN = 'broadcast_access_token';

  constructor(
    private actions$: Actions,
    private store$: Store<forRoot.State>,
    private authResource: AuthResourceService,
    private route: ActivatedRoute,
    private router: Router,
    private socketConnectionService: SocketConnectionService<ISocketMessage, ISocketSendMessage>,
    private cookieService: CookieService, // @todo. local storage
    @Inject(IsMainApp) private isMainApp: boolean,
  ) {}

  @Effect()
  signIn$ = this.actions$.pipe(
    ofType<AuthSignIn>(AuthActionTypes.SignIn),
    switchMap(({payload: { credential }}) =>
      this.authResource.signIn(credential).pipe(
        map(({ token }) => new AuthSignInSuccess({ token })),
        catchError((resp = {}) => {
          const errors = typeof resp.error === 'object' ? resp.error : {},
            // When previous password been imported and cannot migrate to new database.
            passwordBeenReset = resp.status === 204;

          return of(new AuthSignInError({ errors, passwordBeenReset }));
        })
      )
    )
  );

  @Effect()
  signInFacebook$ = this.actions$.pipe(
    ofType<AuthSignInFacebook>(AuthActionTypes.SignInFacebook),
    switchMap(({ payload: { code }}) =>
      this.authResource.signInFacebook(code).pipe(
        map(({ token, error }) => {
          if (error) {
            return new AuthSignInError({ errors: { 'non_field_errors': [error] }, passwordBeenReset: false });
          }
          return new AuthSignInSuccess({ token });
        })
      )
    )
  );

  @Effect()
  signInTwitter$ = this.actions$.pipe(
    ofType<AuthSignInTwitter>(AuthActionTypes.SignInTwitter),
    switchMap(({ payload: { credentials } }) =>
      this.authResource.signInTwitter(credentials).pipe(
        map(({ error, token }) => {
          if (error) {
            return new AuthSignInError({ errors: { 'non_field_errors': [error] }, passwordBeenReset: false });
          }
          return new AuthSignInSuccess({ token });
        })
      )
    )
  );

  @Effect({ dispatch: false })
  signInSuccess$ = this.actions$.pipe(
    ofType(AuthActionTypes.SignInSuccess),
    tap(() => {
      this.navigateToStoredDestination();
      window['dataLayerPush']('wchLogin', 'Sign in', 'success', 'click', null, null);
    })
  );

  @Effect()
  signInSocialSuccess$ = this.actions$.pipe(
    ofType<AuthSignInSocialSuccess>(AuthActionTypes.SignInSocialSuccess),
    map(() => {
      const token = this.cookieService.get(this.ACCESS_TOKEN) || null;
      if (token) {
        return new AuthSignInSuccess({ token });
      } else {
        return new AuthSignInError({
          errors: {
            'non_field_errors': ['Sorry we can\'t authorize you without email connected to your social network account.']
          },
          passwordBeenReset: false
        });
      }
    })
  );

  @Effect()
  signUp$ = this.actions$.pipe(
    ofType<AuthSignUp>(AuthActionTypes.SignUp),
    switchMap(({payload: { credential, redirect }}) =>
      this.authResource.signUp(credential).pipe(
        map(({ token }) => new AuthSignUpSuccess({ token, redirect })),
        catchError((resp = {}) => {
          const errors = resp.error || {};

          return of(new AuthSignUpError({ errors }));
        })
      )
    )
  );

  @Effect()
  activate$ = this.actions$.pipe(
    ofType<AuthActivate>(AuthActionTypes.Activate),
    switchMap(({payload: { credential }}) =>
      this.authResource.activate(credential).pipe(
        map(({ token }) => new AuthActivateSuccess({ token })),
        catchError((resp = {}) => {
          const errors = resp.error && resp.error.detail
            ? { detail: [resp.error.detail] }
            : {};

          return of(new AuthActivateError({ errors }));
        })
      )
    )
  );

  @Effect({ dispatch: false })
  signUpSuccess$ = this.actions$.pipe(
    ofType(AuthActionTypes.SignUpSuccess),
    tap(({ payload: {redirect }}) => {
      if (redirect !== undefined) {
        if (typeof redirect === 'boolean' && redirect) {
          this.navigateToStoredDestination();
        } else if (typeof redirect === 'string') {
          this.navigateToStoredDestination(redirect);
        }
      } else {
        this.navigateToStoredDestination();
      }
    })
  );

  @Effect()
  passwordReset$ = this.actions$.pipe(
    ofType<AuthPasswordReset>(AuthActionTypes.PasswordReset),
    switchMap(({payload: { credential }}) =>
      this.authResource.passwordReset(credential).pipe(
        map(() => new AuthPasswordResetSuccess()),
        catchError((resp = {}) => {
          const errors = resp.error || {};

          return of(new AuthPasswordResetError({ errors }));
        })
      )
    )
  );

  @Effect()
  newPassword$ = this.actions$.pipe(
    ofType<AuthNewPassword>(AuthActionTypes.NewPassword),
    switchMap(({payload: { credential }}) =>
      this.authResource.passwordResetConfirm(credential).pipe(
        map(() => new AuthNewPasswordSuccess()),
        catchError((resp = {}) => {
          const errors = resp.error || {};

          return of(new AuthNewPasswordError({ errors }));
        })
      )
    )
  );

  @Effect()
  logout$ = this.actions$.pipe(
    ofType(AuthActionTypes.Logout),
    switchMap(() => [new AuthClearToken(), new AccountReset(), new AuthSignUpSuccessClear()])
  );

  @Effect({ dispatch: false })
  logoutRedirect$ = this.actions$.pipe(
    ofType(AuthActionTypes.Logout),
    // Redirect to the home page if user has opened page that need authorization.
    tap(() => this.currentPageIsNeedGuard(IsAuthorizedGuard) && this.router.navigate(['/']))
  );

  @Effect()
  getUid$ = this.actions$.pipe(
    ofType<AuthGetUid>(AuthActionTypes.GetUid),
    mergeMap(({ payload: { needSetCookie } }) => this.authResource.getUid().pipe(
      tap(({ uid }) => {
        if (needSetCookie) {
          this.cookieService.put('userId', uid);
        } else {
          if (this.cookieService.get('userId') !== uid) {
            this.cookieService.remove('userId');
          }
        }
      }),
      map(({ uid }) => new AuthGetUidSuccess({ uid })),
      catchError((resp = {}) => {
        console.error('AuthGetUid', resp);

        return of(new AuthGetUidError());
      })
    ))
  );

  @Effect()
  getUidWhenLoginAndSignUp$ = this.actions$.pipe(
    ofType<AuthSignInSuccess | AuthSignUpSuccess | AuthSetToken>(
      AuthActionTypes.SignInSuccess,
      AuthActionTypes.SignUpSuccess,
      AuthActionTypes.RefreshTokenSuccess,
      AuthActionTypes.SetToken,
    ),
    map(() => new AuthGetUid({ needSetCookie: true }))
  );

  @Effect()
  getUidWhenLogout$ = this.actions$.pipe(
    ofType<AuthClearToken>(
      AuthActionTypes.ClearToken
    ),
    map(() => new AuthGetUid({ needSetCookie: false }))
  );

  @Effect()
  refreshCurrentToken$ = this.actions$.pipe(
    ofType<AuthRefreshCurrentToken>(AuthActionTypes.RefreshCurrentToken),
    switchMap(() => this.store$.pipe(
      select(selectToken),
      take(1),
      map(token => new AuthRefreshToken({ token, force: true }))
    ))
  );

  @Effect()
  refreshToken$ = this.actions$.pipe(
    ofType<AuthRefreshToken>(AuthActionTypes.RefreshToken),
    switchMap(({ payload: { token, isInit, force } }): Observable<Action> => {
      if (tokenRefreshTimeLeft(token) > TIME_1_MINUTE || force) {
        return this.authResource.refreshToken(token).pipe(
          switchMap(({ token: newToken }) => {
            const actions: Action[] = [new AuthRefreshTokenSuccess({ token: newToken })];

            if (isInit) {
              actions.push(new AuthInit());
            }

            return actions;
          }),
          catchError(() => {
            const actions: Action[] = [new AuthRefreshTokenError()];

            if (isInit) {
              actions.push(new AuthInit());
            }

            return actions;
          })
        );
      } else {
        // Logout when refresh time is expired.
        return of(new AuthLogout());
      }
    })
  );

  @Effect({ dispatch: false })
  saveTokenCookie$ = this.actions$.pipe(
    ofType<AuthSignInSuccess | AuthSignUpSuccess | AuthRefreshTokenSuccess>(
      AuthActionTypes.SignInSuccess,
      AuthActionTypes.SignUpSuccess,
      AuthActionTypes.RefreshTokenSuccess
    ),
    tap(({ payload: { token } }) => this.saveToken(token))
  );

  @Effect({ dispatch: false })
  saveTokenFromSet$ = this.actions$.pipe(
    ofType<AuthSetToken>(
      AuthActionTypes.SetToken,
    ),
    tap(({ payload: { token } }) => this.saveToken(token)),
  );

  @Effect({ dispatch: false })
  removeTokenCookie$ = this.actions$.pipe(
    ofType(AuthActionTypes.ClearToken),
    tap(() => this.removeToken())
  );

  @Effect()
  setTokenRefreshTimeout$ = this.actions$.pipe(
    ofType<AuthSignInSuccess | AuthSignUpSuccess | AuthRefreshTokenSuccess | AuthSetToken | AuthClearToken>(
      AuthActionTypes.SignInSuccess,
      AuthActionTypes.SignUpSuccess,
      AuthActionTypes.RefreshTokenSuccess,
      AuthActionTypes.SetToken,
      AuthActionTypes.ClearToken
    ),
    map((action) => action instanceof AuthClearToken ? null : action.payload.token),
    switchMap(token => {
      if (token) {
        // 10 minutes before expiration or after 1 minute.
        const refreshLeftTime = Math.max(tokenTimeLeft(token) - TIME_10_MINUTES, TIME_1_MINUTE);

        return timer(refreshLeftTime * 1000).pipe(
          mapTo(new AuthRefreshToken({ token }))
        );
      } else {
        return EMPTY;
      }
    })
  );

  @Effect({ dispatch: false })
  openSocketConnection$ = this.actions$.pipe(
    ofType(AuthActionTypes.GetUidSuccess),
    tap(({payload: {uid}}) => this.socketConnectionService.initConnection(uid))
  );

  @Effect()
  init$ = defer((): Observable<Action> => {
    return of({type: ''});
  })
    .pipe(
      delay(0),
      withLatestFrom(this.store$.select(selectToken)),
      switchMap(([action, storeToken]) => {
        const token = this.cookieService.get(this.ACCESS_TOKEN);

        if (token && (!storeToken || storeToken && storeToken === token)) {
          const timeLeft = tokenTimeLeft(token);
          const refreshTimeLeft = tokenRefreshTimeLeft(token);
          if (timeLeft > TIME_10_MINUTES) {
            return fromArray([new AuthSetToken({ token }), new AuthInit()]);

          } else if (timeLeft > TIME_1_MINUTE || refreshTimeLeft > 0) {
            return of(new AuthRefreshToken({ token, isInit: true }));

          } else {
            return fromArray([new AuthClearToken(), new AuthInit()]);
          }
        }

        return fromArray([new AuthInit(), new AuthGetUid({ needSetCookie: false })]);
      })
    );

  private saveToken(token) {
    const tokenData = decodeToken(token);

    const options = {
      expires: new Date(tokenData.exp * 1000),
      path: '/'
    };

    this.cookieService.put(this.ACCESS_TOKEN, token, options);
  }

  private removeToken() {

    this.cookieService.remove(this.ACCESS_TOKEN);
  }

  private currentPageIsNeedGuard(guard: any, route = this.route) {
    const forAuthorized = route.routeConfig
      && route.routeConfig.canActivate
      && route.routeConfig.canActivate.includes(guard);

    return forAuthorized || route.children.some(this.currentPageIsNeedGuard.bind(this, guard));
  }

  private tryNavigate(destination?: string) {
    const navigateSuccess = this.router.navigateByUrl(decodeURI(destination), { replaceUrl: true });
    navigateSuccess.then((isSuccess) => {
      if (!isSuccess) {
        return this.currentPageIsNeedGuard(IsNotAuthorizedGuard) && this.router.navigate(['/'], { replaceUrl: true });
      }
    });
    return navigateSuccess;
  }

  private navigateToStoredDestination(destination?: string) {
    if (destination !== undefined) {
      return this.tryNavigate(destination);
    }

    this.route.queryParamMap
      .pipe(take(1))
      .subscribe((params: ParamMap) => {
        destination = params.get('destination');
        if (destination) {
          return this.tryNavigate(destination);
        } else {
          return this.currentPageIsNeedGuard(IsNotAuthorizedGuard) && this.router.navigate(['/'], { replaceUrl: true });
        }}, () => {
          return this.currentPageIsNeedGuard(IsNotAuthorizedGuard) && this.router.navigate(['/'], { replaceUrl: true });
        });
  }
}
