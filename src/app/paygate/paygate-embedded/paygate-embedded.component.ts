import { Component, ViewChild, OnInit, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY } from 'rxjs';
import { Store } from '@ngrx/store';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { PaygateService } from '../../client/paygate.service';
import { PaymentInfoFormComponent } from '../payment-info-form/payment-info-form.component';
import { PaygateEmbeddedService } from './paygate-embedded.service';
import { Subscriptions, SubscriptionHelper } from '../../shared/helpers/subscription.helper';
import * as fromAccount from '../../account/account-store/account.reducer';
import { AccountRefresh } from '../../account/account-store/account.actions';


@Component({
  selector: 'wc-paygate-embedded',
  templateUrl: './paygate-embedded.component.html',
  styleUrls: ['./paygate-embedded.component.scss']
})
export class PaygateEmbeddedComponent implements OnInit, OnDestroy {
  subs: Subscriptions = {};
  paymentFormError: string;

  @ViewChild('paygateWrapper') paygateWrapper: ElementRef;
  @ViewChild('paymentForm') paymentForm: PaymentInfoFormComponent;

  constructor(
    private paygatetService: PaygateService,
    public paygateEmbeddedService: PaygateEmbeddedService,
    private cd: ChangeDetectorRef,
    private store$: Store<fromAccount.State>,
  ) {}

  ngOnInit(): void {
    this.subs.paygateEmbeddedIsShow = this.paygateEmbeddedService.isShowPaygate$.subscribe((isShow: boolean) => {
      this.cd.markForCheck();
      return isShow && setTimeout(() => {
        this.paygateWrapper.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    });
    this.subs.paygateEmbeddedBuyComplete = this.paygateEmbeddedService.buyCompleted$.subscribe((ok) => {
      this.paymentForm.initForm();
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  submit(stripeId: string, isPlan: boolean) {
    if (this.paymentForm.paymentInfoForm.invalid) {
      return;
    }

    this.getPaymentToken().pipe(
      switchMap((stripeToken) => {
        let request: any = {
          stripeToken
        };
        if(isPlan) {
          request.plan = stripeId;
        } else {
          request.sku = stripeId;
        }
        return isPlan ? this.paygatetService.buyPlan(request) : this.paygatetService.buyProduct(request);
      }),
      catchError((response: HttpErrorResponse) => {
        if (response.error) {
          this.paymentFormError = `Error, please contact support.`;
        }
        return EMPTY;
      }),
      finalize(() => {
        this.store$.dispatch(new AccountRefresh());
      }),
    ).subscribe(() => {
      this.paygateEmbeddedService.buyComplete();
    });
  }

  getPaymentToken() {
    const card: any = (({ card_number, exp_month, exp_year, cvc, card_name }) => ({
      cvc,
      number: card_number,
      expMonth: exp_month, 
      expYear: exp_year,
      name: card_name
    }))(this.paymentForm.paymentInfoForm.value);


    return this.paygatetService.getPayToken(card).pipe(
      catchError((response: HttpErrorResponse) => {
        if (response.error) {
          this.paymentFormError = response.error.error['message'];
        }
        return EMPTY;
      })
    );
  }
}
