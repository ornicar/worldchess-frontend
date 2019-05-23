import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import * as forRoot from '../../../../reducers';
import { delay, filter, map, takeUntil } from 'rxjs/operators';
import { AuthSignIn } from '../../../../auth/auth.actions';
import { selectIsAuthorized, selectSignInErrors, selectSignInLoading } from '../../../../auth/auth.reducer';
import { PaygatePopupService } from '../../../../modules/paygate/services/paygate-popup.service';

@Component({
  selector: 'wc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {

  form = new FormGroup({
    email: new FormControl('', [
      Validators.email,
      Validators.required,
    ]),
    password: new FormControl('', [
      Validators.required,
    ]),
  });

  loginIncorrect$ = this.store$.pipe(
    select(selectSignInErrors),
    filter(errors => Object.keys(errors).length > 0),
  );

  loading$ = this.store$.pipe(
    select(selectSignInLoading),
  );

  isAuthorized$ = this.store$.pipe(select(selectIsAuthorized));

  showForm$ = combineLatest(
    this.loading$,
    this.isAuthorized$,
  ).pipe(
    map(([loading, isAuthorized]) => {
      return !loading && !isAuthorized;
    }),
  );

  destroy$ = new Subject();

  constructor(
    // TODO remove store
    private store$: Store<forRoot.State>,
    private router: Router,
    private paygatePopupService: PaygatePopupService,
  ) {
  }

  ngOnInit() {
    this.isAuthorized$.pipe(
      takeUntil(this.destroy$),
      filter(isAuthorized => !!isAuthorized),
    ).subscribe(() => {
      this.paygatePopupService.navigateNextStep('login');
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  submit() {
    if (this.form.valid) {
      this.store$.dispatch(new AuthSignIn({ credential: this.form.value }));
    }
  }

  closePopup() {
    this.paygatePopupService.closePopup();
  }
}
