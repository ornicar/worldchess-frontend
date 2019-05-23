import { Injectable} from '@angular/core';
import { Actions, Effect, ofType} from '@ngrx/effects';
import { of} from 'rxjs';
import { Store } from '@ngrx/store';
import { catchError, switchMap, withLatestFrom } from 'rxjs/operators';
import { AuthRefreshCurrentToken} from '../../auth/auth.actions';
import { AccountResourceService} from './account-resource.service';
import {
  AccountActionTypes,
  AccountUpdate,
  AccountUpdateError,
  AccountUpdateSuccess,
  OpenWannaBeOrgModal,
  CloseWannaBeOrgModal,
  CreateFideId,
  CreateFideIdSuccess,
  CreateFideIdError,
  AccountRefresh,
} from './account.actions';
import { FounderStatus } from './account.model';
import * as fromAccount from './account.reducer';

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
          founder_approve_status === FounderStatus.NONE && newAccount.founder_approve_status === FounderStatus.WAIT ?
            new OpenWannaBeOrgModal() :
            new CloseWannaBeOrgModal()
        ]),
        catchError((resp = {}) => {
          const errors = resp.error || {};

          return of(new AccountUpdateError({ errors }));
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

}
