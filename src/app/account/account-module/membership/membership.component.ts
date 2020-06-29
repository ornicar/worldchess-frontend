import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { Tournament } from '@app/broadcast/core/tournament/tournament.model';
import * as fromRoot from '../../../reducers';
import { IAccount } from '../../account-store/account.model';
import { selectMyAccount } from '../../account-store/account.reducer';
import { ISubscription, PlanType } from '@app/purchases/subscriptions/subscriptions.model';
import {
  selectActivePlanSubscription,
  selectFideIdPlan,
  selectProPlan
} from '@app/purchases/subscriptions/subscriptions.reducer';
import { SubscriptionHelper, Subscriptions } from '@app/shared/helpers/subscription.helper';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { environment } from '../../../../environments/environment';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';


const PRO_PLAN = environment.pro_plan_stripe_id;
const PREMIUM_PLAN = environment.premium_plan_stripe_id;

@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipComponent implements OnInit, OnDestroy {
  private subs: Subscriptions = {};
  isFirstTime = false;

  account$: Observable<IAccount> = this.store$.pipe(
    select(selectMyAccount)
  );

  activeSubscription$: Observable<ISubscription> = this.store$.pipe(
    select(selectActivePlanSubscription),
  );

  accountType$: Observable<PlanType> = this.activeSubscription$.pipe(
    map((activeSubscription: ISubscription) => {
      if (activeSubscription) {
        if (activeSubscription.plan.stripe_id === PRO_PLAN) {
          return PlanType.PRO;
        } else if (activeSubscription.plan.stripe_id === PREMIUM_PLAN) {
          return PlanType.PREMIUM;
        } else {
          return PlanType.BASIC;
        }
      } else {
        return PlanType.BASIC;
      }
    }),
  );

  fidePlan$: Observable<ISubscription> = this.store$.pipe(
    select(selectFideIdPlan),
    filter(p => p && p.is_active),
  );

  proPlan$: Observable<ISubscription> = this.store$.pipe(
    select(selectProPlan),
    filter(p => p && p.is_active),
  );

  tournaments: Tournament[];

  readonly now = new Date().getTime();

  constructor(private store$: Store<fromRoot.State>,
              private router: Router,
              private modal: ModalWindowsService,
              private cd: ChangeDetectorRef,
              private paygatePopupService: PaygatePopupService) {}

  ngOnInit() {
    this.paygatePopupService.isFirstTime$.pipe(take(1)).subscribe((isFirstTime) => {
      if (isFirstTime) {
        this.isFirstTime = isFirstTime;
        this.paygatePopupService.setState({
          proSelected: false,
          fideSelected: false,
          isFirstTime: false,
        });
      }
    });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }
}
