import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { ISubscription } from '@app/purchases/subscriptions/subscriptions.model';
import { AccountVerification } from '@app/account/account-store/account.model';
import { map, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { CancelRenewSubscription, ReactivateSubscription } from '@app/purchases/subscriptions/subscriptions.actions';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '@app/reducers';
import { PaygateService } from '@app/modules/paygate/services/paygate.service';
import { selectFideCancelRenewInProgress } from '@app/purchases/subscriptions/subscriptions.reducer';

@Component({
  selector: 'wc-fide-online-status',
  templateUrl: './fide-online-status.component.html',
  styleUrls: ['./fide-online-status.component.scss']
})
export class FideOnlineStatusComponent implements OnInit, OnDestroy, OnChanges {

  @Input() fidePurchased: Partial<ISubscription> = {};
  @OnChangesInputObservable('fidePurchased')
  fidePurchased$ = new BehaviorSubject<ISubscription>(this.fidePurchased as ISubscription);

  @Input()
  isFirstTime = true;

  @Input()
  fideIdState: AccountVerification;
  @OnChangesInputObservable('fideIdState')
  fideIdState$ = new BehaviorSubject<AccountVerification>(this.fideIdState);

  fideSelected$ = this.paygatePopupService.fideSelected$;
  fideProduct$ = this.paygatePopupService.fideProduct$;

  isCancelRenewInProgress = this.store$.pipe(select(selectFideCancelRenewInProgress));

  destroy$ = new Subject();

  constructor(private paygatePopupService: PaygatePopupService,
              private paygateService: PaygateService,
              private store$: Store<fromRoot.State>) { }

  showFideFeatures = false;

  needFideIdAssign$ = combineLatest([
    this.fidePurchased$,
    this.fideIdState$
  ]).pipe(
    map(([fidePurchased, fideIdState]) => {
      return (fidePurchased && !fideIdState);
    }),
  );

  nextPaymentTitle$ = this.fidePurchased$.pipe(
    takeUntil(this.destroy$),
    map((fidePurchased) => {
      if (fidePurchased) {
        return moment(fidePurchased.period.upper).format('MMM DD, YYYY');
      }

      return '';
    }),
  );

  ngOnInit() {
  }

  onFideSelectionChanged(e) {
    this.paygatePopupService.setState({ fideSelected: e.target.checked });
  }

  toggleFideFeatures() {
    this.showFideFeatures = !this.showFideFeatures;
  }

  cancelSubscription() {
    this.store$.dispatch(new CancelRenewSubscription({
      stripe_id: this.fidePurchased.stripe_id,
      notify: true
    }));
  }

  resubscribe() {
    this.store$.dispatch(new ReactivateSubscription({
      stripe_id: this.fidePurchased.stripe_id,
      notify: false
    }));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  @OnChangesObservable()
  public ngOnChanges() {
  }
}
