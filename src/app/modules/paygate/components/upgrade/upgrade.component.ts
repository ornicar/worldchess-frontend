import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { PaygatePopupService } from '../../services/paygate-popup.service';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { ISubscription } from '@app/purchases/subscriptions/subscriptions.model';
import * as moment from 'moment';
import { AccountVerification } from '@app/account/account-store/account.model';

@Component({
  selector: 'wc-upgrade',
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.scss']
})
export class UpgradeComponent implements OnDestroy, OnChanges {
  @Input() proPurchased = {};
  @OnChangesInputObservable('proPurchased')
  proPurchased$ = new BehaviorSubject<ISubscription>(this.proPurchased as ISubscription);

  @Input() fidePurchased = {};
  @OnChangesInputObservable('fidePurchased')
  fidePurchased$ = new BehaviorSubject<ISubscription>(this.fidePurchased as ISubscription);

  @Input() isFirstTime = true;

  @Input() fideIdState: AccountVerification;
  @OnChangesInputObservable('fideIdState')
  fideIdState$ = new BehaviorSubject<AccountVerification>(this.fideIdState);

  proSelected$ = this.paygatePopupService.proSelected$;
  proProduct$ = this.paygatePopupService.proProduct$;
  fideSelected$ = this.paygatePopupService.fideSelected$;
  fideProduct$ = this.paygatePopupService.fideProduct$;

  destroy$ = new Subject();

  popupTitle$ = combineLatest([
    this.proPurchased$,
    this.fidePurchased$,
  ]).pipe(
    takeUntil(this.destroy$),
    map(([proPurchased, fidePurchased]) => {
      let subtitle = 'Upgrade your account to get special features';
      let title = '';
      const onePaymentIsCanceled = proPurchased && proPurchased.cancel_at_period_end ||
        fidePurchased && fidePurchased.cancel_at_period_end;
      const bothSubscriptionsCanceled = proPurchased && proPurchased.cancel_at_period_end
        && fidePurchased && fidePurchased.cancel_at_period_end;

      if (proPurchased) {
        if (!proPurchased.cancel_at_period_end) {
          subtitle = `€<span class="font-size-05">&nbsp;</span><span>${proPurchased.plan.amount / 100}</span><span class="font-size-05">&nbsp;</span>/<span class="font-size-05">&nbsp;</span>year.
            Next payment: ${moment(proPurchased.period.upper).format('MMM DD, YYYY')} for access to video streams`;
        } else if (!fidePurchased) {
          title = `Your Pro account is paid until ${moment(proPurchased.period.upper).format('MMM DD, YYYY')}`;
          subtitle = `Then, your access to all video streams will freeze`;
        }
      }

      if (fidePurchased) {
        if (!fidePurchased.cancel_at_period_end) {
          subtitle = `€<span class="font-size-05">&nbsp;</span><span>${fidePurchased.plan.amount / 100}</span><span class="font-size-05">&nbsp;</span>/<span class="font-size-05">&nbsp;</span>year.
            Next payment: ${moment(fidePurchased.period.upper).format('MMM DD, YYYY')} for FIDE Online Rating`;
        } else if (!proPurchased) {
          title = `Your Pro account is paid until ${moment(fidePurchased.period.upper).format('MMM DD, YYYY')}`;
          subtitle = `Then, your access to FIDE Online rating will freeze`;
        }
      }

      if (proPurchased && fidePurchased) {
        const nearestPayment = moment(fidePurchased.period.upper).diff(proPurchased.period.upper);
        let titleNearestPayment = '';

        if (nearestPayment > 0) {
          titleNearestPayment = `€<span class="font-size-05">&nbsp;</span>${proPurchased.plan.amount / 100}
            ${moment(proPurchased.period.upper).format('MMM DD, YYYY')} for access to video streams`;
          if (bothSubscriptionsCanceled) {
            title = `Your Pro account is paid until ${moment(proPurchased.period.upper).format('MMM DD, YYYY')}`;
            subtitle = `Then, your access to all video streams will freeze`;
          }
        } else {
          titleNearestPayment = `€<span class="font-size-05">&nbsp;</span>${fidePurchased.plan.amount / 100}
            ${moment(fidePurchased.period.upper).format('MMM DD, YYYY')} for FIDE Online Rating`;
          if (bothSubscriptionsCanceled) {
            title = `Your Pro account is paid until ${moment(fidePurchased.period.upper).format('MMM DD, YYYY')}`;
            subtitle = `Then, your access to FIDE Online rating will freeze`;
          }
        }

        if (!onePaymentIsCanceled) {
          subtitle = `€<span class="font-size-05">&nbsp;</span><span>${(fidePurchased.plan.amount + proPurchased.plan.amount) / 100}</span><span class="font-size-05">&nbsp;</span>/<span class="font-size-05">&nbsp;</span>year.
                        Next payment: ${titleNearestPayment}`;
          title = '';
        }
      }

      if (!title) {
        title = proPurchased || fidePurchased
          ? (this.isFirstTime ? 'You got a World Chess Pro account' : 'You have a World Chess Pro account' )
          : (this.isFirstTime ? 'You got a World Chess Free account' : 'You have a World Chess Free account');
      }

      return {
        title,
        subtitle
      };
    }),
  );

  canUpgrade$ = combineLatest([
    this.proSelected$,
    this.proPurchased$,
    this.fideSelected$,
    this.fidePurchased$,
  ]).pipe(
    map(([proSelected, proPurchased, fideSelected, fidePurchased]) => {
      return (proSelected && !proPurchased) || (fideSelected && !fidePurchased);
    }),
  );

  needFideIdAssign$ = combineLatest([
    this.fidePurchased$,
    this.fideIdState$
  ]).pipe(
    map(([fidePurchased, fideIdState]) => {
      return (fidePurchased && !fideIdState);
    }),
  );

  resultPrice$ = combineLatest([this.proSelected$, this.proProduct$, this.fideSelected$, this.fideProduct$]).pipe(
    map(([proSelected, proProduct, fideSelected, fideProduct]) => {
      return (proSelected && proProduct ? proProduct.amount : 0) + (fideSelected && fideProduct ? fideProduct.amount : 0 );
    })
  );

  loading$ = new BehaviorSubject<boolean>(false);

  constructor(private paygatePopupService: PaygatePopupService) {}

  goToGift() {
    console.error('Not implemented yet');
  }

  goToUpgrade() {
    this.canUpgrade$.pipe(take(1)).subscribe((canUpgrade) => {
      if (canUpgrade) {
        this.paygatePopupService.stepLoaded$.next('payment');
        this.paygatePopupService.navigateNextStep('upgrade');
      }
    });
  }

  goToUpgradeFide() {
    this.needFideIdAssign$.pipe(
      take(1)
    ).subscribe((needFideIdAssign) => {
      if (needFideIdAssign) {
        this.paygatePopupService.setState({ fideSelected: true });
        this.paygatePopupService.stepLoaded$.next('payment');
        this.paygatePopupService.navigateNextStep('payment');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  @OnChangesObservable()
  public ngOnChanges() {
  }
}
