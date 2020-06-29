import { Component, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { Validators, AbstractControl, FormBuilder, ValidationErrors } from '@angular/forms';
import { BehaviorSubject, throwError, combineLatest, Subject } from 'rxjs';
import { map, switchMap, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { PaygatePopupService } from '../../services/paygate-popup.service';
import { AuthResourceService } from '@app/auth/auth-resource.service';
import { PaygateForm } from '@app/modules/paygate/_shared/paygate-form.class';
import { PaygateFormControl } from '@app/modules/paygate/_shared/paygate-form-control.class';
import { AuthSignUpSuccess } from '@app/auth/auth.actions';
import { Store } from '@ngrx/store';
import * as fromRoot from '@app/reducers';
import { selectToken } from '@app/auth/auth.reducer';
import { PaygateService } from '@app/modules/paygate/services/paygate.service';

const passwdRegex = /^(?=.*[a-z,A-Z])(?=.*\d).{8,}$/i;

@Component({
  selector: 'wc-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnDestroy {

  history = window.history;

  maxSteps$ = this.paygatePopupService.maxSteps$;

  @Input() embedded = false;
  @Output() success = new EventEmitter();

  form = new PaygateForm({
    password: new PaygateFormControl('', [Validators.required]),
    repeat: new PaygateFormControl('', [Validators.required]),
  }, [
    (form: PaygateForm) => {
      const {password, repeat} = form.value;
      if (password && repeat) {
        if (password === repeat) {
          return null;
        } else {
          return {equality: true};
        }
      } else {
        return {required: true};
      }
    },
  ]);

  loading$ = new BehaviorSubject(false);
  destroy$ = new Subject();
  equalityError$ = this.form.invalid$.pipe(
                         map(invalid => invalid ? this.form.hasError('equality') : false)
                       );

  token$ = this.store$.select(selectToken);

  constructor(
    private paygatePopupService: PaygatePopupService,
    private paygateService: PaygateService,
    private authResourceService: AuthResourceService,
    private store$: Store<fromRoot.State>
  ) {
    this.paygatePopupService.setState({ currentStep: 'password' });
    this.form.submit$
        .pipe(
          takeUntil(this.destroy$),
        )
        .subscribe(() => this.submit());
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  submit() {
    const { password } = this.form.value;

    this.loading$.next(true);

    this.paygatePopupService.activation$.pipe(
      take(1),
      switchMap((activation) => {
        if (activation) {
          return this.authResourceService.passwordResetConfirm({
            uid: activation.uid,
            token: activation.token,
            new_password: password,
          });
        } else {
          return throwError({ error: ['Invalid activation data'], });
        }
      }),
      withLatestFrom(this.token$)
    ).subscribe(([activation, token]) => {
      this.loading$.next(false);

      if (this.embedded) {
          this.success.emit(true);
        } else {
          window['dataLayerPush']('wchReg', 'Become a member', 'Password confirm', this.paygateService.calcTotalForGtag(), '3', null);
          this.paygatePopupService.navigateNextStep('password');
        }
        if (token) {
          this.store$.dispatch(new AuthSignUpSuccess({ token, redirect: false }));
          this.paygatePopupService.setState({ isFirstTime: true });
          this.paygatePopupService.reset();
        } else {
          this.authResourceService.signIn({
            email: this.paygatePopupService.email$.value,
            password
          }).subscribe((response) => {
            this.store$.dispatch(new AuthSignUpSuccess({ token: response.token, redirect: false }));
            this.paygatePopupService.setState({ isFirstTime: true });
            this.paygatePopupService.reset();
          });
        }
      }, ({ error }) => {
        this.form.controls['password'].setErrors({strong: true});
        this.loading$.next(false);
      }, () => this.loading$.next(false));
  }
}
