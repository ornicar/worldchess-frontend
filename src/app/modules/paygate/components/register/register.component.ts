import { Component, OnDestroy } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, of, Subject } from 'rxjs';
import {
  map,
  take,
  takeUntil,
  filter,
  withLatestFrom,
  catchError,
  mergeMap,
  tap,
  delay,
} from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { PaygatePopupService } from '../../services/paygate-popup.service';
import { AuthResourceService } from '@app/auth/auth-resource.service';
import * as fromRoot from '../../../../reducers';
import { AuthSetTokenDirty } from '@app/auth/auth.actions';
import { PaygateFormControl } from '@app/modules/paygate/_shared/paygate-form-control.class';
import { PaygateForm } from '@app/modules/paygate/_shared/paygate-form.class';
import { PaygateService } from '@app/modules/paygate/services/paygate.service';

const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

@Component({
  selector: 'wc-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnDestroy {

  popupState$ = this.paygatePopupService.state$;

  proSelected$ = this.paygatePopupService.proSelected$;
  proProduct$ = this.paygatePopupService.proProduct$;
  fideSelected$ = this.paygatePopupService.fideSelected$;
  fideProduct$ = this.paygatePopupService.fideProduct$;

  form = new PaygateForm({
    email: new PaygateFormControl(
      this.paygatePopupService.email$.value,
      [
        Validators.email,
        Validators.required,
        Validators.pattern(emailRegex),
      ],
      ),
  });

  showProFeatures = false;
  showFideFeatures = false;

  resultPrice$ = combineLatest([this.proSelected$, this.proProduct$, this.fideSelected$, this.fideProduct$]).pipe(
    map(([proSelected, proProduct, fideSelected, fideProduct]) => {
      return (proSelected && proProduct ? proProduct.amount : 0) + (fideSelected && fideProduct ? fideProduct.amount : 0 );
    })
  );

  loading$ = new BehaviorSubject<boolean>(false);
  destroy$ = new Subject();

  constructor(
    private paygatePopupService: PaygatePopupService,
    private paygateService: PaygateService,
    private store$: Store<fromRoot.State>,
    private authResource: AuthResourceService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.paygatePopupService.setState({ currentStep: 'register' });
    this.form.statusChanges.pipe(
      takeUntil(this.destroy$),
      withLatestFrom(this.loading$),
      map(([status, loading]) => {
        if (status === 'PENDING' && !loading) {
          return true;
        } else if (status !== 'PENDING' && loading) {
          return false;
        } else {
          return null;
        }
      }),
      filter(state => state !== null),
    ).subscribe(this.loading$);

    this.form.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((formValue) => {
      this.paygatePopupService.email$.next(formValue.email);
    });

    this.form.submit$.pipe(
      tap(() => this.loading$.next(true)),
      map(() => this.form.value.email),
      withLatestFrom(this.fideSelected$, this.proSelected$),
      mergeMap(([email, fideSelected, proSelected]) => {
        return this.authResource.checkEmail(email).pipe(
          map(() => false),
          catchError(response => {
            if (response.status === 409) {
              this.form.controls['email'].setErrors({exists: true});
              return of(false);
            } else {
              window['dataLayerPush']('wchReg', 'Become a member', 'Become a member', this.paygateService.calcTotalForGtag(), '1', null);
              this.paygatePopupService.email$.next(email);
              return this.authResource.signUpCode({
                email,
                is_paid: fideSelected || proSelected
              }).pipe(map(({token}) => token));
            }
          }),
        );
      }),
      filter(v => !!v),
      tap((token: string) => {
        this.store$.dispatch(new AuthSetTokenDirty({ token }));
        this.paygatePopupService.setState({
          token,
          email: this.paygatePopupService.email$.value,
        });
        this.paygatePopupService.navigateNextStep('register');
      }),
      delay(1000),
    ).subscribe(
      () => {
        this.loading$.next(false);
      },
      (error) => {
        console.warn(error);
        this.form.controls['email'].setErrors({ response: true });
        this.loading$.next(false);
      },
    );
  }

  goToLogin() {
    this.activatedRoute.queryParams.pipe(take(1)).subscribe((queryParams) => {
      this.router.navigate(['', { outlets: { p: ['paygate', 'login'] } }], { queryParams });
    });
    window['dataLayerPush']('wchReg', 'Become a member', 'popup buttons', 'Sing in', null, null);
  }

  onProSelectionChanged(e) {
    this.paygatePopupService.setState({ proSelected: e.target.checked });
    window['dataLayerPush']('wchReg', 'Become a member', 'popup buttons', 'Access to all video streams', null, null);
  }

  onFideSelectionChanged(e) {
    this.paygatePopupService.setState({ fideSelected: e.target.checked });
    window['dataLayerPush']('wchReg', 'Become a member', 'popup buttons', 'FIDE&nbsp;ID Online rating', null, null);
  }

  toggleProFeatures() {
    this.showProFeatures = !this.showProFeatures;
  }

  toggleFideFeatures() {
    this.showFideFeatures = !this.showFideFeatures;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
