import { Component, OnDestroy } from '@angular/core';
import { Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, finalize, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { PaygatePopupService } from '../../services/paygate-popup.service';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../../reducers';
import { ScreenStateService } from '@app/shared/screen/screen-state.service';
import { AuthRefreshCurrentToken } from '@app/auth/auth.actions';
import { PaygateService } from '@app/modules/paygate/services/paygate.service';
import { PaygateForm } from '@app/modules/paygate/_shared/paygate-form.class';
import { PaygateFormControl } from '@app/modules/paygate/_shared/paygate-form-control.class';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'wc-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnDestroy {
  history = window.history;
  public promocodeAccepted: boolean;
  public isShownPromocodeScreen = false;

  months = moment.months().map((month, index) => {
    const value = index + 1;
    const label = value < 10 ? `0${value}` : value;
    return { label, value };
  });
  years = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
    const value = moment().year() + i;
    return { label: String(value).slice(-2), value };
  });

  maxSteps$ = this.paygatePopupService.maxSteps$;
  title = '';

  form = new PaygateForm({
    card_number: new PaygateFormControl(null, [
      Validators.required,
      Validators.minLength(16),
    ]),
    cvc: new PaygateFormControl(null, [
      Validators.required,
      Validators.minLength(3),
    ]),
    exp_month: new PaygateFormControl(null, [Validators.required]),
    exp_year: new PaygateFormControl(null, [Validators.required]),
    name: new PaygateFormControl(null, [Validators.required]),
    promocode: new PaygateFormControl(''),
  });

  destroy$ = new Subject();

  proSelected$ = this.paygatePopupService.proSelected$;
  fideSelected$ = this.paygatePopupService.fideSelected$;

  title$ = combineLatest([
    this.proSelected$,
    this.fideSelected$
  ]).pipe(takeUntil(this.destroy$), map(([proSelected, fideSelected]) => {
    return this.calcTitle(proSelected, fideSelected);
  }));

  totalPrice$ = this.paygateService.cart.pipe(
    map((cart) => cart.total)
  );

  loading$ = new BehaviorSubject(false);
  controlErrors: {[k: string]: BehaviorSubject<boolean>} = {};

  public isMobile: boolean;

  constructor(
    private paygatePopupService: PaygatePopupService,
    private paygateService: PaygateService,
    private store$: Store<fromRoot.State>,
    private screenService: ScreenStateService,
    private route: ActivatedRoute,
  ) {
    this.screenService.matchMediaMobile$.subscribe(isMobile => this.isMobile = isMobile);
    Object.keys(this.form.controls).forEach((name) => {
      this.controlErrors[name] = new BehaviorSubject<boolean>(false);
      this.form.controls[name].valueChanges.pipe(
        takeUntil(this.destroy$),
      ).subscribe(() => {
        this.controlErrors[name].next(this.form.controls[name].invalid);
      });
    });

    if (this.route.snapshot.fragment === 'pro') {
      this.paygatePopupService.setState({
        proSelected: true,
      });
    }

    this.form.submit$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.submit();
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  calcTitle(premium: boolean, fide: boolean): string {
    if (fide && premium) {
      return 'Fill in your payment information to&nbsp;pay  for&nbsp;' +
        'access to&nbsp;all&nbsp;video streams and official FIDE Online Rating';
    }

    if (fide) {
      return 'Fill in your payment information to&nbsp;pay  for&nbsp;' +
        'access to official FIDE Online Rating';
    }

    if (premium) {
      return 'Fill in your payment information to&nbsp;pay for&nbsp;' +
        'access to&nbsp;all&nbsp;video streams';
    }
  }

  proceed(): Observable<any> {
    return this.paygateService.buy({
      number: this.form.value.card_number,
      expMonth: this.form.value.exp_month,
      expYear: this.form.value.exp_year,
      cvc: this.form.value.cvc,
      name: this.form.value.name,
    });
  }

  submit() {
    Object.values(this.form.controls).forEach(control => control.markAsDirty());

    if (this.form.valid) {
      this.loading$.next(true);
      this.proceed().pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading$.next(false))
      ).subscribe(() => {
        this.sendGtagData('Checkout');
        this.store$.dispatch(new AuthRefreshCurrentToken());
        this.paygatePopupService.navigateNextStep('payment');
      }, response => {
        if (response.error.error.type === 'card_error') {
          this.controlErrors['cvc'].next(true);
        }
      });
    } else {
      Object.values(this.form.controls).forEach((control) => {
        control.updateValueAndValidity();
      });
    }
  }

  public applyPromocode(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const control = this.form.controls.promocode;

    if (!control.value) {
      return control.shake$.next(true);
    }

    control.markAsPending();

    this.paygateService.applyPromoCode(control.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe((wasApplied) => {
        if (wasApplied) {
          this.promocodeAccepted = true;
          this.form.controls.promocode.disable();
          this.sendGtagData('Promo сode apply');
        } else {
          control.reset(control.value);
          this.form.controls['promocode'].setErrors({Unknown: true});
        }
      });
  }

  public togglePromocodeScreen(): void {
    this.isShownPromocodeScreen = !this.isShownPromocodeScreen;
    this.sendGtagData('I have a promo code');
    if (!this.isShownPromocodeScreen) {
      this.form.controls.promocode.reset('');
      this.form.controls.promocode.enable();
      this.promocodeAccepted = false;
    }
  }

  sendGtagData(eventAction: string) {
    window['dataLayerPush'](
      'wchReg',
      'Become a member',
      eventAction,
      this.paygateService.calcTotalForGtag(),
      this.paygatePopupService.stepLoaded$.value === 'payment' ? '1' : '4',
      this.paygateService.calcTotalWithCouponForGtag()
    );
  }
}



