import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, EMPTY, Subject } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { AuthSignUp, AuthSignUpClearError, AuthSignUpSuccess, AuthSignUpError } from '../../auth/auth.actions';
import { selectSignUpErrors, selectSignUpLoading, selectIsAuthorized } from '../../auth/auth.reducer';
import * as fromRoot from '../../reducers/index';
import { FounderStatus } from '../../account/account-store/account.model';
import { SubscriptionHelper, Subscriptions } from '../../shared/helpers/subscription.helper';
import { FormHelper } from '../../shared/helpers/form.helper';
import { PlanType } from '../../paygate/choose-plan/choose-plan.component';
import { IPlan } from '../../purchases/plan/plan.model';
import { PaymentInfoFormComponent } from '../../paygate/payment-info-form/payment-info-form.component';
import { AuthResourceService } from '../../auth/auth-resource.service';
import { PaygateService } from '../../client/paygate.service';
import { ITokenResponse, ISignUpCredential } from '../../auth/auth.model';
import { BuyObserver } from '../../paygate/buy-observer';
import { GetUserPurchases } from '../../purchases/user-purchases/user-purchases.actions';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit, OnDestroy {
  formErrors$ = this.store$.pipe(select(selectSignUpErrors));
  loading$ = this.store$.pipe(select(selectSignUpLoading));
  public signUpForm: FormGroup;
  private subs: Subscriptions = {};

  passwordMatchError = false;
  paymentError = '';

  PlanType = PlanType;
  selectedPlan: IPlan = null;
  selectedPlanType: PlanType = PlanType.BASIC;
  sub: Subscriptions = {};
  userToken: string = null;

  choosePlanScroll = new Subject();

  isAuthorized: boolean;
  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized)
  )

  @ViewChild('paymentForm') paymentForm: PaymentInfoFormComponent;
  @ViewChild('anchor') anchor: ElementRef;
  @ViewChild('selectPlan') selectPlan: ElementRef;

  constructor(private store$: Store<fromRoot.State>,
              private authResource: AuthResourceService,
              private paygatetService: PaygateService,
              private buyObserver: BuyObserver,
              private router: Router,
              private route: ActivatedRoute) {}

  signUp() {
    this.signUpForm.updateValueAndValidity();
    if (this.signUpForm.invalid) {
      return;
    }

    if(this.signUpForm.value.password !== this.signUpForm.value.repeat_password) {
      this.passwordMatchError = true;
      return;
    } else {
      this.passwordMatchError = false;
    }

    if (this.selectedPlanType !== PlanType.BASIC) {
      this.paymentForm.paymentInfoForm.updateValueAndValidity();
      if (this.paymentForm.paymentInfoForm.invalid) {
        return;
      }
    }

    const credential: any = (({full_name, password, email}) => ({
      email,
      password,
      full_name,
      receive_newsletters: true,
    }))(this.signUpForm.value);

    if (this.signUpForm.value['founder_approve_status']) {
      credential.founder_approve_status = FounderStatus.WAIT;
    }

    if (this.selectedPlanType === PlanType.BASIC)  {
      this.store$.dispatch(new AuthSignUp({credential, redirect: '/account/profile'}));
    } else {
      if(!this.isAuthorized) {
        this.authSignUp(credential).subscribe(
          () => {
            this.buyObserver.emitBuyStart(true);
          }
        );
      } else {
        this.buyObserver.emitBuyStart(true);
      }
    }
  }

  authSignUp(credential: ISignUpCredential): Observable<ITokenResponse> {
    return this.authResource.signUp(credential).pipe(
      tap(
        ({ token }) => {
          this.userToken = token;
          return this.store$.dispatch(new AuthSignUpSuccess({ token, redirect: false }))
        },
        (resp = {}) => {
          const errors = resp.error || {};

          this.store$.dispatch(new AuthSignUpError({ errors }));
        })
    );
  }

  getPaymentToken() {
    const card: any = (({ card_number, cvc, exp_month, exp_year, card_name }) => ({
      cvc,
      number: card_number,
      expMonth: exp_month, 
      expYear: exp_year,
      name: card_name
    }))(this.paymentForm.paymentInfoForm.value);

    return this.paygatetService.getPayToken(card).pipe(
      catchError((response: HttpErrorResponse) => {
        if (response.error) {
          this.paymentError = response.error.error['message'];
        }
        return EMPTY;
      })
    );
  }

  buy() {
    this.getPaymentToken().pipe(
      switchMap((stripeToken) => {
        const request = {
          stripeToken,
          plan: this.selectedPlan.stripe_id,
        };
        return this.paygatetService.buyPlan(request);
      }),
      catchError((response: HttpErrorResponse) => {
        if (response.error) {
          this.paymentError = `Error, please contact support.`;
        }
        return EMPTY;
      })
    ).subscribe(() => {
      this.buyEnd();
    });
  }

  buyEnd() {
    this.store$.dispatch(new GetUserPurchases());
    this.router.navigate(['account', 'profile'], { replaceUrl: true });
  }

  ngOnInit(): void {
    this.initForm();
    this.sub.buy = this.buyObserver.buyObs.subscribe(() => {
      this.buy();
    });
    this.sub.auth = this.isAuthorized$.subscribe((isAuthorized) => {
      this.isAuthorized = isAuthorized;
    });
  }

  private initForm() {
    this.signUpForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      full_name: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      repeat_password: new FormControl('', [Validators.required]),
      founder_approve_status: new FormControl(false, []),
    });

    this.subs.formErrors = this.formErrors$
      .pipe(
        map(FormHelper.mapResponseError)
      )
      .subscribe(errs => {
        FormHelper.mapErrorsToFormGroup(this.signUpForm, errs);
      });
  }

  ngOnDestroy() {
    this.store$.dispatch(new AuthSignUpClearError());
    SubscriptionHelper.unsubscribe(this.subs);
  }

  onPlanSelected({ plan ,type } : { plan: IPlan, type: PlanType }) {
    this.selectedPlan = plan;
    this.selectedPlanType = type;
    this.anchor.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
