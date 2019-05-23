import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import * as fromRoot from '@app/reducers';
import { selectIsAuthorized } from '@app/auth/auth.reducer';

@Injectable()
export class PaygatePopupManagerService {

  constructor(private router: Router,
              private store$: Store<fromRoot.State>) {}

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized),
  );

  openPaygatePopupWithPurchase(product: string) {
    this.isAuthorized$.pipe(
      take(1),
    ).subscribe((isAuthorized: boolean) => {
      if (isAuthorized) {
        this.openPaygatePopup('purchase', { queryParams: { product }, fragment: 'tournament' });
      } else {
        this.openPaygatePopup('register', { queryParams: { product } });
      }
    });
  }

  openPaygatePopupWithPlanPayment(plan = 'pro') {
    this.isAuthorized$.pipe(
      take(1),
    ).subscribe((isAuthorized) => {
      if (isAuthorized) {
        this.openPaygatePopup('payment', { fragment: plan });
      } else {
        this.openPaygatePopup('register', { fragment: plan });
      }
    });
  }

  openPaygatePopup(step = 'login', params = {}) {
    this.router.navigate(['', { outlets: { p: ['paygate', step] }}], params);
  }
}
