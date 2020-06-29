import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { catchError, distinctUntilChanged, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { AuthLogout, AuthRefreshCurrentToken } from '../../auth/auth.actions';
import { AccountResourceService } from './account-resource.service';
import {
  AccountActionTypes,
  AccountUpdate,
  AccountUpdateError,
  AccountUpdateSuccess,
  AccountDelete,
  AccountDeleteError,
  AccountDeleteSuccess,
  CreateFideId,
  CreateFideIdSuccess,
  CreateFideIdError,
  AccountRefresh,
  CancelFounderStatus,
  RequestFounderStatus,
  FounderStatusError,
  AccountLoadRatingSuccess,
  AccountLoadSuccess,
} from './account.actions';
import * as fromAccount from './account.reducer';
import { AddSubscriptions } from '@app/purchases/subscriptions/subscriptions.actions';
import * as moment from 'moment';

@Injectable()
export class AccountEffects {

  constructor(
    private actions$: Actions,
    private store$: Store<fromAccount.State>,
    private accountResource: AccountResourceService
  ) {}

  @Effect()
  update$ = this.actions$.pipe(
    ofType<AccountUpdate>(AccountActionTypes.Update),
    withLatestFrom(this.store$.select(fromAccount.selectMyAccount)),
    switchMap(([{ payload: { account } }, { founder_approve_status}]) =>
      this.accountResource.updateProfile(account).pipe(
        switchMap((newAccount) => [
          new AccountUpdateSuccess({ account: newAccount }),
          new AuthRefreshCurrentToken(),
        ]),
        catchError((resp = {}) => {
          const errors = resp.error || {};

          return of(new AccountUpdateError({ errors }));
        })
      )
    )
  );

  @Effect()
  delete$ = this.actions$.pipe(
    ofType<AccountDelete>(AccountActionTypes.Delete),
    switchMap(() =>
      this.accountResource.deleteProfile().pipe(
        switchMap(() => [
          new AccountDeleteSuccess(),
          new AuthLogout(),
        ]),
        catchError((resp = {}) => {
          const errors = resp.error || {};

          return of(new AccountDeleteError({ errors }));
        })
      )
    )
  );

  @Effect()
  refresh$ = this.actions$.pipe(
    ofType<AccountRefresh>(AccountActionTypes.Refresh),
    switchMap(() => this.accountResource.getProfile()),
    switchMap((account) => [new AccountUpdateSuccess({account: account})]),
  );

  @Effect()
  accountUpdateSuccess$ = this.actions$.pipe(
    ofType<AccountUpdateSuccess>(AccountActionTypes.UpdateSuccess),
    switchMap((account) => [new AddSubscriptions({
      subscriptions: account.payload.account.subscriptions,
      count: account.payload.account.subscriptions.length
    })]),
  );

  @Effect()
  refreshRating$ = this.actions$.pipe(
    ofType<AccountLoadSuccess | AccountUpdateSuccess>(
      AccountActionTypes.LoadSuccess,
      AccountActionTypes.UpdateSuccess
    ),
    switchMap(() => this.accountResource.getRating()),
    switchMap((rating) => [new AccountLoadRatingSuccess({ rating })]),
  );

  @Effect()
  initIntercomChat = this.actions$.pipe(
    ofType<AccountLoadSuccess>(AccountActionTypes.LoadSuccess),
    distinctUntilChanged(),
    tap((account) => {
      (<any>window).Intercom('boot', {
        app_id: 'krpcser0',
        name: account.payload.account.full_name,
        email: account.payload.account.email,
        created_at: moment(account.payload.account.since).unix()
      });
    })
  );

  @Effect()
  getFideId$ = this.actions$.pipe(
    ofType<CreateFideId>(AccountActionTypes.CreateFideId),
    switchMap(() => {
       return this.accountResource.createFideId().pipe(
        switchMap((fideId) => [
          new AuthRefreshCurrentToken(),
          new CreateFideIdSuccess({ fideId })
        ]),
        catchError(response => of(new CreateFideIdError({ errorMessage: response.error ? response.error.detail : 'Unknown error' }))),
       );
      })
  );

  @Effect()
  requestFounderStatus$ = this.actions$.pipe(
    ofType<RequestFounderStatus>(AccountActionTypes.RequestFounderStatus),
    switchMap(() => this.accountResource.requestFounserStatusApprovement().pipe(
      switchMap(() => of(new AccountRefresh())),
      catchError(() => of(new FounderStatusError({ errorMessage: 'Error while requesting founder status', }))),
    )),
  );

  @Effect()
  cancelFounderStatus$ = this.actions$.pipe(
    ofType<CancelFounderStatus>(AccountActionTypes.CancelFounderStatus),
    switchMap(() => this.accountResource.cancelFounderStatus().pipe(
      switchMap(() => of(new AccountRefresh())),
      catchError(() => of(new FounderStatusError({ errorMessage: 'Error while canceling founder status', }))),
    )),
  );
}
