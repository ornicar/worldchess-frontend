import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, throwError, combineLatest, of, Observable } from 'rxjs';
import { switchMap, map, merge, finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { PaygateService } from '../../../../client/paygate.service';
import { PaygatePopupService, PlanType } from '../../services/paygate-popup.service';
import { ISpecialPlanProduct } from '../../models';
import { select, Store } from '@ngrx/store';
import { ISubscription } from '@app/purchases/subscriptions/subscriptions.model';
import * as fromRoot from '../../../../reducers';
import * as fromSubscription from '../../../../purchases/subscriptions/subscriptions.reducer';
import { IChargePlanRequest } from '@app/paygate/dto/buy-request';
import { ScreenStateService } from '@app/shared/screen/screen-state.service';
import { AuthRefreshCurrentToken } from '@app/auth/auth.actions';


@Component({
  selector: 'wc-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
  paymentError$ = new BehaviorSubject<{ [key: string]: string[] }>({});
  public promocodeError: string;
  private _discountPercent = new BehaviorSubject(null);
  public discountPercent$ = this._discountPercent.asObservable();
  private _discount = new BehaviorSubject(null);
  public discount$ = this._discount.asObservable();
  public promocodeAccepted: boolean;
  public isShownPromocodeScreen = true;

  months = moment.months().map((month, index) => ({ label: month, value: index + 1 }));
  years = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => { const value = moment().year() + i; return { label: value, value }; });


  form = new FormGroup({
    card_number: new FormControl('', [ Validators.required ]),
    cvc: new FormControl('', [ Validators.required ]),
    exp_month: new FormControl('', [ Validators.required ]),
    exp_year: new FormControl('', [ Validators.required ]),
    name: new FormControl('', [ Validators.required ]),
    promocode: new FormControl(''),
  });

  formErrors$ = this.form.valueChanges.pipe(
    merge(this.paymentError$),
    map(() => {
      const responseErrors = this.paymentError$.getValue();
      const errors = {};
      Object.keys(this.form.controls).forEach((control) => {
        if (this.form.controls[control].dirty) {
          const controlErrors = {
            ...this.form.controls[control].errors,
            ...(responseErrors[control] && responseErrors[control].length ? { response: responseErrors[control][0] } : {})
          };
          errors[control] = controlErrors;
        }
      });
      return errors;
    }),
  );

  subscriptions$: Observable<ISubscription[]> = this.store$.pipe(
    select(fromSubscription.selectAll),
  );

  isFide$ = this.subscriptions$.pipe(
    map((subscriptions: ISubscription[]) => {
      const fidePlan = subscriptions.find((s: ISubscription) => s.plan.name === 'FIDE-ID');
      const premiumPlan = subscriptions.find((s: ISubscription) => s.plan.name === 'PREMIUM');
      return !!fidePlan || !!premiumPlan;
    }),
  );

  totalPrice$ = combineLatest(
    this.paygatePopupService.plan$,
    this.paygatePopupService.products$,
    this.paygatePopupService.fideSelected$,
    this.isFide$,
    this.discountPercent$,
    this.discount$,
    ).pipe(
      map(([plan, products, fideSelected, isFide, discountPercent, discount]) => {
        if (!plan || !products) {
          return 0;
        }
        const proProduct = products.find(p => p.name === 'PRO');
        const premiumProduct = products.find(p => p.name === 'PREMIUM');
        const fideProduct = products.find(p => p.name === 'FIDE-ID');

        let result = 0;

        switch (plan) {
          case 'basic': {
            result = fideSelected && !isFide ? fideProduct.amount : 0;
            break;
          }
          case 'pro': {
            result = fideSelected ? proProduct.amount + (isFide ? 0 : fideProduct.amount) : proProduct.amount;
            break;
          }
          case 'premium': {
            result = premiumProduct.amount;
            break;
          }
        }

        if (discountPercent && discountPercent > 0) {
          result = result - (result * (discountPercent / 100));
        }

        if (discount && discount > 0) {
          result -= discount;
        }

        return result;
      }),
  );

  private _loading = new BehaviorSubject(false);
  loading$ = this._loading.asObservable();

  public isMobile: boolean;

  constructor(
    private paygatePopupService: PaygatePopupService,
    private paygateService: PaygateService,
    private store$: Store<fromRoot.State>,
    private router: Router,
    private screenService: ScreenStateService,
  ) {
    this.screenService.matchMediaMobile$.subscribe(isMobile => this.isMobile = isMobile);
  }

  getPayToken(): Observable<string> {
    const card = {
      number: this.form.value.card_number,
      expMonth: this.form.value.exp_month,
      expYear: this.form.value.exp_year,
      cvc: this.form.value.cvc,
      name: this.form.value.name,
    };
    return this.paygateService.getPayToken(card);
  }

  buy(products: ISpecialPlanProduct[], plan: PlanType, fideSelected: boolean, stripeToken: string): Observable<any> {
    if (plan === 'basic' && fideSelected) {
      return this.buyFide(products, plan, fideSelected, stripeToken);
    } else {
      const product = products.find(p => p.name === plan.toUpperCase());
      if (product) {
        return this.buyPlan(stripeToken, product).pipe(
          switchMap(() => this.getPayToken().pipe(
            switchMap(newStripeToken => this.buyFide(products, plan, fideSelected, newStripeToken)),
          )),
        );
      } else {
        return throwError({ error: ['Purchased failed'] });
      }
    }
  }

  buyFide(products: ISpecialPlanProduct[], plan: PlanType, fideSelected: boolean, stripeToken: string): Observable<any> {
    if ((plan === 'pro' || plan === 'basic') && fideSelected) {
      const fideProduct = products.find(p => p.name === 'FIDE-ID');
      return fideProduct ? this.buyPlan(stripeToken, fideProduct) : throwError({ error: ['Invalid FIDE ID product'] });
    } else {
      return of(true);
    }
  }

  buyPlan(stripeToken, product): Observable<any> {
    const planRequest: IChargePlanRequest = {
      stripeToken,
      plan: product.stripe_id,
    };

    if (this.promocodeAccepted) {
      planRequest.coupon = this.form.controls.promocode.value;
    }

    return this.paygateService.buyPlan(planRequest);
  }

  submit() {
    this._loading.next(true);
    Object.values(this.form.controls).forEach(control => control.markAsDirty());
    this.paymentError$.next({});

    if (this.form.valid) {
      const fideSelected = this.paygatePopupService.fideSelected$.getValue();
      const plan = this.paygatePopupService.plan$.getValue();
      const products = this.paygatePopupService.products$.getValue();

      if (!plan || !products) {
        this.paymentError$.next({ error: ['Unknown error'] });
        this._loading.next(false);
      } else {
        this.getPayToken().pipe(
          switchMap(stripeToken => this.buy(products, plan, fideSelected, stripeToken)),
          finalize(() => this._loading.next(false)),
        ).subscribe(() => {
          this.store$.dispatch(new AuthRefreshCurrentToken());
          this.paygatePopupService.navigateNextStep('payment');
        }, error => this.paymentError$.next(error));
      }
    } else {
      this._loading.next(false);
    }
  }

  closePopup() {
    this.paygatePopupService.closePopup();
  }

  public applyPromocode(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    this.promocodeError = null;
    const promocode = this.form.controls.promocode.value;
    this._loading.next(true);

    this.paygateService.checkPromoCode(promocode).pipe(
      finalize(() => this._loading.next(false)),
    ).subscribe((coupon) => {
      if (coupon.valid) {
        this.promocodeAccepted = true;
        this._discountPercent.next(coupon.percentOff);
        this._discount.next(coupon.amountOff);
        this.form.controls.promocode.disable();
      }
    }, (error) => {
      this.promocodeError = 'Promocode is not valid';
    });
  }

  public hidePromocodeScreen(): void {
    this.isShownPromocodeScreen = false;
  }

}



