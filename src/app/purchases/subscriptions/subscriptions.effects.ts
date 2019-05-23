import { Injectable } from '@angular/core';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable, of, from } from 'rxjs';
import { map, switchMap, catchError, merge, mergeAll, tap } from 'rxjs/operators';

import {
  GetSubscriptions,
  SubscriptionActionTypes,
  LoadSubscription,
  ClearSubscriptions,
  AddSubscriptions,
  CancelRenewSubscription,
  CloseCancelRenewDialog,
  UpdateSubscription
} from './subscriptions.actions';
import {
  AuthActionTypes,
  AuthSetToken,
  AuthRefreshTokenSuccess,
  AuthSignInSuccess,
  AuthSignUpSuccess,
  AuthClearToken
} from '../../auth/auth.actions';
import { SubscriptionsResourceService } from './subscriptions-resource.service';
import { fromArray } from 'rxjs/internal/observable/fromArray';
import { ISubscription } from './subscriptions.model';
import { Update } from '@ngrx/entity';
import * as forRoot from '../../reducers';

@Injectable()
export class SubscriptionsEffects {

  constructor(
    private actions$: Actions,
    private purchasesResource: SubscriptionsResourceService,
    private store$: Store<forRoot.State>
  ) { }

  @Effect()
  subscriptions$: Observable<Action> = this.actions$.pipe(
    ofType<GetSubscriptions>(SubscriptionActionTypes.GetSubscriptions),
    switchMap(action =>
      this.purchasesResource
        .getAll(action.payload.params).pipe(
          map(({ subscriptions, count }) => new AddSubscriptions({ subscriptions, count })),
        )
    ),
  );

  // @Effect()
  // onTokenActions$ = this.actions$.pipe(
  //   ofType<AuthSignInSuccess | AuthSignUpSuccess | AuthRefreshTokenSuccess | AuthSetToken>(
  //     AuthActionTypes.SignInSuccess,
  //     AuthActionTypes.SignUpSuccess,
  //     AuthActionTypes.RefreshTokenSuccess,
  //     AuthActionTypes.SetToken,
  //   ),
  //   map(() => new GetSubscriptions())
  // );

  @Effect()
  onCancelRenew$: Observable<Action> = this.actions$.pipe(
    ofType<CancelRenewSubscription>(SubscriptionActionTypes.CancelRenewSubscription),
    switchMap(action =>
      this.purchasesResource
        .cancelRenewSubscription(action.payload.stripe_id).pipe(
          map(() => {
            const update: Update<ISubscription> = {
              id: action.payload.stripe_id,
              changes: { cancel_at_period_end: null }
            };
            this.store$.dispatch(new CloseCancelRenewDialog());
            return new UpdateSubscription({ subscription: update});
          }),
          catchError((res = {}) => {
            if (res.error) {
              console.error(res.error);
            }
            return of(new CloseCancelRenewDialog());
          })
        )
    ),
  );

  @Effect()
  onClearToken$ = this.actions$.pipe(
    ofType<AuthClearToken>(AuthActionTypes.ClearToken),
    map(() => new ClearSubscriptions())
  );

}
