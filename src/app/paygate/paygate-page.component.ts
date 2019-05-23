import {Component, OnDestroy, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {selectIsAuthorized, selectProfile} from '../auth/auth.reducer';
import * as fromRoot from '../reducers';
import {SubscriptionHelper, Subscriptions} from '../shared/helpers/subscription.helper';
import {Plan} from './dto/plan';
import {PaygateCharge} from './paygate-charge';
import { selectMainSelling } from '../purchases/selling/selling.reducer';
import { Observable, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';

@Component({
  selector: 'app-paygate-page',
  templateUrl: './paygate-page.component.html',
  styleUrls: ['./paygate-page.component.scss']
})
export class PaygatePageComponent implements OnInit, OnDestroy {
  private subs: Subscriptions = {};

  plansFn = PaygateCharge.plans;
  plans = [];

  selectedPlan: Plan = null;
  checkoutShowed = false;

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized)
  );

  selling$ = this.store$.pipe(
    select(selectMainSelling)
  );

  plans$: Observable<Plan[]> = this.selling$.pipe(
    map(sellings => {
      if (sellings) {
        const { main_plan, main_product } = sellings;
        return this.plansFn(main_plan, main_product); // @todo fix it.
      } else {
        return [];
      }
    })
  );

  profile$ = this.store$.pipe(
    select(selectProfile)
  );

  constructor(private store$: Store<fromRoot.State>) { }

  ngOnInit() {
    this.subs.plan = this.plans$.subscribe((plans) => this.plans = plans);
  }

  ngOnDestroy() {
    document.body.style.overflowY = null;
    SubscriptionHelper.unsubscribe(this.subs);
  }

  hideCheckout() {
    document.body.style.overflowY = null;
    this.checkoutShowed = false;
  }

  showCheckout() {
    document.body.style.overflowY = 'hidden';
    this.checkoutShowed = true;
  }
  // @TODO_PURCHASE push plan || product from backend to the purchase page
  selectPlan(plan) {
    this.selectedPlan = plan;
    this.showCheckout();
  }
}
