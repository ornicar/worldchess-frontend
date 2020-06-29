import {Component, OnInit} from '@angular/core';
import {select, Store} from "@ngrx/store";
import {selectIsAuthorized} from "@app/auth/auth.reducer";
import * as fromRoot from "@app/reducers";
import {Router} from "@angular/router";
import {PaygatePopupService} from "@app/modules/paygate/services/paygate-popup.service";
import {environment} from "../../../../../../environments/environment";
import {take, takeUntil} from "rxjs/operators";
import {selectMyAccount} from "@app/account/account-store/account.reducer";
import {BehaviorSubject, Subject} from "rxjs";
import {IAccount} from "@app/account/account-store/account.model";

const FIDE_PLAN_STRIPE_ID = environment.fide_id_plan_stripe_id;

@Component({
  selector: 'main-page-legalise-your-skills',
  templateUrl: './main-page-legalise-your-skills.component.html',
  styleUrls: ['./main-page-legalise-your-skills.component.scss']
})
export class MainPageLegaliseYourSkillsComponent implements OnInit {

  constructor(
    private paygatePopupService: PaygatePopupService,
    private store$: Store<fromRoot.State>,
    private router: Router) {
  }

  ngOnInit() {
    this.store$.pipe(
      select(selectIsAuthorized),
    ).pipe(takeUntil(this.destroy$))
      .subscribe(value => this.isAuthorized$.next(value));
    this.store$.pipe(
      select(selectMyAccount),
    ).pipe(takeUntil(this.destroy$))
      .subscribe(value => this.account$.next(value));

  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  destroy$ = new Subject();

  isAuthorized$ = new BehaviorSubject(false);

  account$: BehaviorSubject<IAccount | undefined> = new BehaviorSubject<IAccount | undefined>(undefined);

  register(e: MouseEvent) {
    e.preventDefault();
    if (this.isAuthorized$.value) {
      const account = this.account$.value;
      if (account) {
        if (account.subscriptions.filter(substriction => substriction.is_active && substriction.plan && substriction.plan.stripe_id === FIDE_PLAN_STRIPE_ID).length) {
          this.paygatePopupService.setState({fideSelected: true});
          this.router.navigate(['/account/membership'])
        }
      }
    } else {
      this.paygatePopupService.setState({fideSelected: true});
      this.router.navigate(['', {outlets: {p: ['paygate', 'register']}}]);
    }
  };
}
