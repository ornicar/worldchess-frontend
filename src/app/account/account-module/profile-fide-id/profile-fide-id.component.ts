import { Component, OnInit, isDevMode } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {IPurchasePlan} from '../../../purchases/user-purchases/user-purchases.model';
import * as fromRoot from '../../../reducers';
import {selectFideId, selectFideIdErrorMsg, selectMyAccount, selectMyAccountRating} from '../../account-store/account.reducer';
import { CreateFideId } from '../../account-store/account.actions';
import { selectProfile } from '../../../auth/auth.reducer';
import { IAccountRating, AccountVerification } from '@app/account/account-store/account.model';
import { Router } from '@angular/router';

enum PurchasePlansStatus {
  EXPIRED = 0,
  ACTIVE = 1,
}

@Component({
  selector: 'app-profile-fide-id',
  templateUrl: 'profile-fide-id.component.html',
  styleUrls: [
    '../profile/profile.component.scss',
    'profile-fide-id.component.scss',
  ]
})
export class ProfileFideIdComponent implements OnInit {
  // form: FormGroup;
  // fideId$ = this.store$.pipe(select(selectFideId));
  // fideIdErrorMsg$ = this.store$.pipe(select(selectFideIdErrorMsg));
  // profile$ = this.store$.pipe(select(selectProfile));
  account$ = this.store$.pipe(select(selectMyAccount));

  rating$: Observable<IAccountRating> = this.store$.pipe(select(selectMyAccountRating));
  hasFideRating$: Observable<boolean> = this.rating$.pipe(
    map(rating => Boolean(rating.fide_rating))
  );

  AccountVerification = AccountVerification;
  PurchasePlansStatus = PurchasePlansStatus;

  private nowDate = new Date();

  public showMoreRating = false;

  constructor(
    private store$: Store<fromRoot.State>,
    private router: Router,
  ) { }

  ngOnInit() {
    // this.form = new FormGroup({
    //   fideId: new FormControl({ value: '', disabled: true })
    // });
    // this.fideId$.subscribe(fideId => this.setFideId(fideId));
    // this.profile$.subscribe(profile => this.setFideId(profile.fide_id));

    // this.rating$.subscribe(a => console.log(1, a));
  }

  getPurchasePlansStatus(plan: IPurchasePlan): PurchasePlansStatus {
    const upper = new Date(plan.period.upper);

    return upper.getTime() > this.nowDate.getTime()
      ? PurchasePlansStatus.ACTIVE
      : PurchasePlansStatus.EXPIRED;
  }

  onShowMoreRating() {
    this.showMoreRating = !this.showMoreRating;
  }

  upgrade() {
    this.router.navigate(['', { outlets: { p: ['paygate', 'payment'] } }], { fragment: 'pro', queryParams: { upgrade: 'basic' } });
  }

  // public onGetFideId() {
  //   this.store$.dispatch(new CreateFideId());
  // }
  //
  // private setFideId(fideId: number) {
  //   if (!fideId) {
  //     return;
  //   }
  //
  //   this.form.controls.fideId.setValue(fideId);
  // }
  //
  // get isDevMode(): boolean {
  //   return isDevMode();
  // }
}
