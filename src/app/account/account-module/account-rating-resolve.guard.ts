import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AccountResourceService } from '../account-store/account-resource.service';
import { AccountLoadRatingSuccess } from '../account-store/account.actions';
import { IAccountRating } from '../account-store/account.model';
import * as fromRoot from '../../reducers';

@Injectable()
export class AccountRatingResolveGuard implements Resolve<IAccountRating> {

  constructor(
    private accountResource: AccountResourceService,
    private store$: Store<fromRoot.State>
  ) {
  }

  resolve(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<IAccountRating> {
    return this.accountResource.getRating().pipe(
      tap(rating => this.store$.dispatch(new AccountLoadRatingSuccess({ rating })))
    );
  }
}
