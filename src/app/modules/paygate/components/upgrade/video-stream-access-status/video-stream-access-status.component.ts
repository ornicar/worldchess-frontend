import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ISubscription } from '@app/purchases/subscriptions/subscriptions.model';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { BehaviorSubject, Subject } from 'rxjs';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '@app/reducers';
import { map, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { CancelRenewSubscription, ReactivateSubscription } from '@app/purchases/subscriptions/subscriptions.actions';
import { selectProCancelRenewInProgress } from '@app/purchases/subscriptions/subscriptions.reducer';

@Component({
  selector: 'wc-video-stream-access-status',
  templateUrl: './video-stream-access-status.component.html',
  styleUrls: ['./video-stream-access-status.component.scss']
})
export class VideoStreamAccessStatusComponent implements OnInit, OnChanges, OnDestroy {
  @Input() proPurchased: Partial<ISubscription> = {};
  @OnChangesInputObservable('proPurchased')
  proPurchased$ = new BehaviorSubject<ISubscription>(this.proPurchased as ISubscription);

  @Input()
  isFirstTime = true;

  showProFeatures = false;
  proSelected$ = this.paygatePopupService.proSelected$;
  proProduct$ = this.paygatePopupService.proProduct$;

  isCancelRenewInProgress = this.store$.pipe(select(selectProCancelRenewInProgress));

  destroy$ = new Subject();

  nextPaymentTitle$ = this.proPurchased$.pipe(
    takeUntil(this.destroy$),
    map((proPurchased) => {
      if (proPurchased) {
        return moment(proPurchased.period.upper).format('MMM DD, YYYY');
      }

      return '';
    }),
  );

  constructor(private paygatePopupService: PaygatePopupService,
              private store$: Store<fromRoot.State>) {
  }

  ngOnInit() {
  }

  onProSelectionChanged(e) {
    this.paygatePopupService.setState({ proSelected: e.target.checked });
  }

  toggleProFeatures() {
    this.showProFeatures = !this.showProFeatures;
  }

  cancelSubscription() {
    this.store$.dispatch(new CancelRenewSubscription({
      stripe_id: this.proPurchased.stripe_id,
      notify: false
    }));
  }

  resubscribe() {
    this.store$.dispatch(new ReactivateSubscription({
      stripe_id: this.proPurchased.stripe_id,
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
