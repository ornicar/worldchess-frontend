import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '@app/reducers';
import { take } from 'rxjs/operators';
import { selectIsAuthorized } from '@app/auth/auth.reducer';
import { AccountResourceService } from '@app/account/account-store/account-resource.service';
import { AddSubscriptions } from '@app/purchases/subscriptions/subscriptions.actions';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';


@Component({
  selector: 'wc-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {
  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized),
  );

  tournamentProduct$ = this.paygatePopupService.tournamentProduct$;

  constructor(private store$: Store<fromRoot.State>,
              private paygatePopupService: PaygatePopupService,
              private accountResourceService: AccountResourceService) {}

  ngOnInit() {
    this.isAuthorized$.pipe(
      take(1),
    ).subscribe((isAuthorized) => {
      if (isAuthorized) {
        this.accountResourceService.getProfile().pipe()
          .subscribe(account => this.store$.dispatch(new AddSubscriptions({
            subscriptions: account.subscriptions,
            count: account.subscriptions.length
          })));
      }
    });
  }
}
