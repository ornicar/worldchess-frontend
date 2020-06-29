import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { AccountResourceService } from '../account-store/account-resource.service';
import { AccountLoadSuccess } from '../account-store/account.actions';
import { IAccount } from '../account-store/account.model';
import * as fromRoot from '../../reducers';
import { AddSubscriptions } from '@app/purchases/subscriptions/subscriptions.actions';
import { selectMyAccount } from '@app/account/account-store/account.reducer';

@Injectable()
export class AccountResolveGuard implements Resolve<IAccount> {

  account$ = this.store$.pipe(
    select(selectMyAccount),
  );

  constructor(
    private accountResource: AccountResourceService,
    private store$: Store<fromRoot.State>
  ) {
  }

  resolve(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<IAccount> {
    return this.account$.pipe(
      take(1),
      switchMap((account: IAccount) => {
        if (!account) {
          return this.accountResource.getProfile().pipe(
            tap(a => this.store$.dispatch(new AddSubscriptions({
              subscriptions: a.subscriptions,
              count: a.subscriptions.length
            }))),
            tap(a => this.store$.dispatch(new AccountLoadSuccess({ account: a })))
          );
        } else {
          return of(account);
        }
      }),
    );
  }
}
