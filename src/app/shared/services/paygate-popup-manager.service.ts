import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import * as fromRoot from '@app/reducers';
import { selectIsAuthorized, selectToken } from '@app/auth/auth.reducer';
import { selectActivePlanSubscription } from '@app/purchases/subscriptions/subscriptions.reducer';
import { ISubscription } from '@app/purchases/subscriptions/subscriptions.model';
import { environment } from '../../../environments/environment';
import { IPlan } from '@app/purchases/plan/plan.model';

const PRO_PLAN = environment.pro_plan_stripe_id;
const PREMIUM_PLAN = environment.premium_plan_stripe_id;


@Injectable()
export class PaygatePopupManagerService {

  constructor(private router: Router,
              private store$: Store<fromRoot.State>) {}

  private _token$ = this.store$.pipe(
    select(selectToken),
    map(t => t ? '?t=' + t : ''),
  );
  private _applicationUrl = environment['applicationUrl'];
  private _gameUrl = environment['gameUrl'];

  isAuthorized$: Observable<boolean> = this.store$.pipe(
    select(selectIsAuthorized),
  );

  activePlanSubscription$: Observable<ISubscription>  = this.store$.pipe(
    select(selectActivePlanSubscription),
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

  openPaygateWithUpgrade() {
    combineLatest(
      this.isAuthorized$,
      this.activePlanSubscription$).pipe(
        take(1),
    ).subscribe(([isAuthorized, activePlanSubscription]) => {
      if (isAuthorized) {
        if (activePlanSubscription) {
          const plan = activePlanSubscription.plan;
          if (plan) {
            const upgrade = this.getPlanName(plan);
            const fragment = 'premium';
            this.openPaygatePopup('payment', { queryParams: { upgrade }, fragment  });
          } else {
            this.openPaygatePopup('payment', { queryParams: { upgrade: 'basic' }, fragment: 'pro' });
          }
        } else {
          this.openPaygatePopup('payment', { queryParams: { upgrade: 'basic' }, fragment: 'pro' });
        }
      } else {
        this.openPaygatePopup('login', { queryParams: { upgrade: true } });
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

  openPaygateWithFideIdForm() {
    this.isAuthorized$.pipe(
      take(1),
    ).subscribe((isAuthorized) => {
      if (isAuthorized) {
        this.openPaygatePopup('fide');
      } else {
        this.openPaygatePopup('register', { fragment: 'pro' });
      }
    });
  }

  openPaygatePopup(step = 'login', params = {}) {
    this.router.navigate(['', { outlets: { p: ['paygate', step] }}], params);
  }

  getPlanName(plan: IPlan): string {
    switch (plan.stripe_id) {
      case PRO_PLAN:
        return 'pro';
      case PREMIUM_PLAN:
        return 'premium';
      default: return 'basic';
    }
  }

  crossAppNavigate(toGaming: boolean, url: string, newWindow: boolean) {
    this._token$.pipe(
      take(1)
    ).subscribe((token) => {
      const crossUrl = toGaming ? this._gameUrl : this._applicationUrl;
      if (!newWindow) {
        if (token) {
          window.location.assign(`${crossUrl}${url}${token}`);
        } else {
          window.location.assign(`${crossUrl}${url}`);
        }
      } else {
        if (token) {
          window.open(`${crossUrl}${url}${token}`);
        } else {
          window.open(`${crossUrl}${url}`);
        }
      }
    });
  }

  crossAppLink(toGaming: boolean, url: string) {
    return this._token$.pipe(
      take(1),
      map((token) => {
        const crossUrl = toGaming ? this._gameUrl : this._applicationUrl;
        if (token) {
          return `${crossUrl}${url}${token}`;
        } else {
          return`${crossUrl}${url}`;
        }
    }));
  }
}
