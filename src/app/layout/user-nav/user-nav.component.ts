import { ChangeDetectorRef, Component, OnDestroy, OnInit, isDevMode } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { map, tap } from 'rxjs/operators';
import { AuthLogout } from '../../auth/auth.actions';
import { selectIsAuthorized } from '../../auth/auth.reducer';
import * as forRoot from '../../reducers';
import { SubscriptionHelper, Subscriptions } from '../../shared/helpers/subscription.helper';
import { selectMyAccount } from '../../account/account-store/account.reducer';
import { IAccount, FounderStatus } from '../../account/account-store/account.model';
import { AccountResourceService } from '../../account/account-store/account-resource.service';
import { AddSubscriptions } from '../../purchases/subscriptions/subscriptions.actions';
import { AccountLoadSuccess } from '../../account/account-store/account.actions';

@Component({
  selector: 'wc-user-nav',
  templateUrl: './user-nav.component.html',
  styleUrls: ['./user-nav.component.scss']
})
export class UserNavComponent implements OnInit, OnDestroy {

  private subs: Subscriptions = {};

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized)
  );

  account$ = this.store$.pipe(
    select(selectMyAccount)
  );

  founderApproved$ = this.account$.pipe(
    map((account: IAccount) => account && account.founder_approve_status === FounderStatus.APPROVE)
  );

  constructor(
    private cd: ChangeDetectorRef,
    private store$: Store<forRoot.State>,
    private accountResourceService: AccountResourceService
  ) { }

  ngOnInit() {

    this.subs.isAuthorized = this.isAuthorized$.subscribe((isAuthorized: boolean) => {
      if (isAuthorized) {
        this.accountResourceService.getProfile().pipe(
          tap(account => this.store$.dispatch(new AddSubscriptions({
            subscriptions: account.subscriptions,
            count: account.subscriptions.length
          }))),
          tap(account => this.store$.dispatch(new AccountLoadSuccess({ account })))
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
