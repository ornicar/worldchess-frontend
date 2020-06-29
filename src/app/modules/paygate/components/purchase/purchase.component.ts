import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, map, switchMap, take, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import * as fromUserPurchases from '@app/purchases/user-purchases/user-purchases.reducer';
import { GetUserPurchases } from '@app/purchases/user-purchases/user-purchases.actions';
import { AuthRefreshCurrentToken } from '@app/auth/auth.actions';
import { PaygateService } from '@app/modules/paygate/services/paygate.service';


@Component({
  selector: 'wc-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss']
})
export class PurchaseComponent {

  purchaseError$ = new BehaviorSubject<{ [key: string]: string[] }>(null);
  months = moment.months().map((month, index) => ({ label: month, value: index + 1 }));
  years = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => { const value = moment().year() + i; return { label: value, value }; });

  loading$ = new BehaviorSubject<boolean>(false);

  tournamentProduct$ = this.paygatePopupService.tournamentProduct$;

  form = new FormGroup({
    card_number: new FormControl('', [ Validators.required ]),
    cvc: new FormControl('', [ Validators.required ]),
    exp_month: new FormControl('', [ Validators.required ]),
    exp_year: new FormControl('', [ Validators.required ]),
    name: new FormControl('', [ Validators.required ]),
  });

  constructor(private router: Router,
              private store$: Store<fromUserPurchases.State>,
              private paygatePopupService: PaygatePopupService,
              private activatedRoute: ActivatedRoute,
              private paygateService: PaygateService) {}

  getControlErrors(control: string): Observable<{ [key: string]: string[]}> {
    return this.form.controls[control].dirty ? this.purchaseError$.pipe(
      take(1),
      map((errors) => {
        return {
          ...(errors && errors[control] && errors[control].length ? { 'response': errors[control][0]} : {}),
          ...this.form.controls[control].errors,
        };
      }),
    ) : of(null);
  }

  getPaymentToken() {
    const card = {
      number: this.form.value.card_number,
      expMonth: this.form.value.exp_month,
      expYear: this.form.value.exp_year,
      cvc: this.form.value.cvc,
      name: this.form.value.name,
    };
    this.loading$.next(true);
    return this.paygateService.getPayToken(card);
  }

  buy() {
    return this.tournamentProduct$.pipe(
      switchMap(({ tournament }) => this.getPaymentToken().pipe(
          switchMap(stripeToken => this.paygateService.buyProduct({
            stripeToken,
            sku: tournament.product,
          })),
        ),
      ),
    );
  }

  submit() {
    if (this.form.valid) {
      this.buy().pipe(
        tap(() => {
          this.store$.dispatch(new GetUserPurchases());
          this.store$.dispatch(new AuthRefreshCurrentToken());
        }),
        finalize(() => {
          this.loading$.next(false);
        }),
      ).subscribe(
        () => {
          this.paygatePopupService.navigateNextStep('purchase');
        },
        error => this.purchaseError$.next(error),
      );
    } else {
      this.purchaseError$.next({ error: ['Invalid data'] });
    }
  }

}
