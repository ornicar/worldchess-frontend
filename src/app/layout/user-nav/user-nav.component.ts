import { ChangeDetectorRef, Component, OnDestroy, OnInit, isDevMode, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { map, tap } from 'rxjs/operators';
import { AuthLogout } from '@app/auth/auth.actions';
import { selectIsAuthorized } from '@app/auth/auth.reducer';
import * as forRoot from '../../reducers';
import { SubscriptionHelper, Subscriptions } from '@app/shared/helpers/subscription.helper';
import { selectMyAccount } from '@app/account/account-store/account.reducer';
import { IAccount, FounderStatus } from '@app/account/account-store/account.model';
import { AccountResourceService } from '@app/account/account-store/account-resource.service';
import { AddSubscriptions } from '@app/purchases/subscriptions/subscriptions.actions';
import { AccountLoadSuccess } from '@app/account/account-store/account.actions';
import { combineLatest } from 'rxjs';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';

@Component({
  selector: 'wc-user-nav',
  templateUrl: './user-nav.component.html',
  styleUrls: ['./user-nav.component.scss']
})
export class UserNavComponent implements OnInit, OnDestroy {
  @Input() primary = false;

  private subs: Subscriptions = {};

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized)
  );

  account$ = this.store$.pipe(
    select(selectMyAccount)
  );

  constructor(
    private cd: ChangeDetectorRef,
    private store$: Store<forRoot.State>,
    private accountResourceService: AccountResourceService,
    public paygateService: PaygatePopupManagerService
  ) { }

  ngOnInit() {
    this.subs.isAuthorized = this.primary && combineLatest(
      this.isAuthorized$,
      this.account$,
    ).subscribe(([isAuthorized, account]) => {
      if (isAuthorized && !account) {
        this.accountResourceService.getProfile().pipe(
          tap(a => this.store$.dispatch(new AddSubscriptions({
            subscriptions: a.subscriptions,
            count: a.subscriptions.length
          }))),
          tap(a => this.store$.dispatch(new AccountLoadSuccess({ account: a })))
        ).subscribe(() => {
          this.cd.markForCheck();
        });
      }
      this.cd.markForCheck();
    });
  }

  logout() {
    this.store$.dispatch(new AuthLogout());
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  get isDevMode(): boolean {
    return isDevMode();
  }
}
