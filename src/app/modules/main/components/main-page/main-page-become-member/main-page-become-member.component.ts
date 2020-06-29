import { Component, OnInit } from '@angular/core';
import {PaygatePopupService} from "@app/modules/paygate/services/paygate-popup.service";
import {select, Store} from "@ngrx/store";
import * as fromRoot from "@app/reducers";
import {Router} from "@angular/router";
import {selectIsAuthorized} from "@app/auth/auth.reducer";
import {takeUntil} from "rxjs/operators";
import {selectMyAccount} from "@app/account/account-store/account.reducer";
import {BehaviorSubject, Subject} from "rxjs";

@Component({
  selector: 'main-page-become-member',
  templateUrl: './main-page-become-member.component.html',
  styleUrls: ['./main-page-become-member.component.scss']
})
export class MainPageBecomeMemberComponent implements OnInit {

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
  }

  destroy$ = new Subject();

  isAuthorized$ = new BehaviorSubject(false);

  register(e: MouseEvent) {
    e.preventDefault();
    if (this.isAuthorized$.value) {
      this.router.navigate(['/account/membership']);
    } else {
      this.paygatePopupService.setState({fideSelected: false});
      this.router.navigate(['', {outlets: {p: ['paygate', 'register']}}]);
    }
  };

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }


}
