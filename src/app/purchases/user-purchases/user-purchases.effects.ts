import { Injectable } from '@angular/core';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { GetUserPurchases, UserPurchaseActionTypes, LoadUserPurchase, ClearUserPurchases } from './user-purchases.actions';
import {
  AuthActionTypes,
  AuthSetToken,
  AuthRefreshTokenSuccess,
  AuthSignInSuccess,
  AuthSignUpSuccess,
  AuthClearToken
} from '../../auth/auth.actions';
import { UserPurchasesResourceService } from './user-purchases-resource.service';

@Injectable()
export class UserPurchasesEffects {

  constructor(
    private actions$: Actions,
    private purchasesResource: UserPurchasesResourceService,
  ) { }

  @Effect()
  purchases$: Observable<Action> = this.actions$.pipe(
    ofType<GetUserPurchases>(UserPurchaseActionTypes.GetUserPurchases),
    switchMap(() =>
      this.purchasesResource.get().pipe(
        map(userPurchase => new LoadUserPurchase({ userPurchase })),
        catchError(errors => {
          console.error(errors);
          return of(new ClearUserPurchases());
        })
      )
    ),
  );

  @Effect()
  onTokenActions$ = this.actions$.pipe(
    ofType<AuthSignInSuccess | AuthSignUpSuccess | AuthRefreshTokenSuccess | AuthSetToken>(
      AuthActionTypes.SignInSuccess,
      AuthActionTypes.SignUpSuccess,
      AuthActionTypes.RefreshTokenSuccess,
      AuthActionTypes.SetToken,
    ),
    map(() => new GetUserPurchases())
  );

  @Effect()
  onClearToken$ = this.actions$.pipe(
    ofType<AuthClearToken>(AuthActionTypes.ClearToken),
    map(() => new ClearUserPurchases())
  );

}
