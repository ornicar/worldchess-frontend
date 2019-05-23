import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AccountResourceService } from '../account-store/account-resource.service';
import { AccountLoadSuccess } from '../account-store/account.actions';
import { IAccount } from '../account-store/account.model';
import * as fromRoot from '../../reducers';
import { AddSubscriptions } from '../../purchases/subscriptions/subscriptions.actions';

@Injectable()
export class AccountResolveGuard implements Resolve<IAccount> {

  constructor(
    private accountResource: AccountResourceService,
    private store$: Store<fromRoot.State>
  ) {
  }

  resolve(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<IAccount> {
    return this.accountResource.getProfile().pipe(
      tap(account => this.store$.dispatch(new AddSubscriptions({
        subscriptions: account.subscriptions,
        count: account.subscriptions.length
      }))),
      tap(account => this.store$.dispatch(new AccountLoadSuccess({ account })))
    );
  }
}
