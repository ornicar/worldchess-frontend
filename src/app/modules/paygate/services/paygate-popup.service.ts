import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, ParamMap, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReplaySubject, BehaviorSubject, Observable, combineLatest, of, Subject } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { filter, map, skipWhile, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { IActivationCodeResponse } from '@app/auth/auth.model';
import { ISpecialPlanProduct } from '../models';
import { ICountry } from '@app/broadcast/core/country/country.model';
import { SubscriptionHelper, Subscriptions } from '@app/shared/helpers/subscription.helper';
import { IProductWithExpand } from '@app/purchases/product/product.model';
import { ProductResourceService } from '@app/purchases/product/product-resource.service';
import * as fromUserPurchase from '@app/purchases/user-purchases/user-purchases.reducer';
import { selectUserPurchase } from '@app/purchases/user-purchases/user-purchases.reducer';
import { IUserPurchase } from '@app/purchases/user-purchases/user-purchases.model';
import { BroadcastType } from '@app/broadcast/core/tournament/tournament.model';
import { selectActivePlanSubscription } from '@app/purchases/subscriptions/subscriptions.reducer';
import { ISubscription } from '@app/purchases/subscriptions/subscriptions.model';
import * as fromSubscriptions from '@app/purchases/subscriptions/subscriptions.reducer';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import { selectIsAuthorized } from '@app/auth/auth.reducer';
import { AccountResourceService } from '@app/account/account-store/account-resource.service';
import { AddSubscriptions } from '@app/purchases/subscriptions/subscriptions.actions';
import { AccountLoadSuccess, AccountRefresh } from '@app/account/account-store/account.actions';
import { selectMyAccount } from '@app/account/account-store/account.reducer';
import { IAccount } from '@app/account/account-store/account.model';
import { PaygateService } from '@app/modules/paygate/services/paygate.service';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';

export type PlanType = 'basic' | 'pro' | 'premium' | 'tournament' | 'fide';

const PAYGATE_LOCAL_STORAGE_KEY = 'PAYGATE_STATE';

const PRO_PLAN_STRIPE_ID = environment.pro_plan_stripe_id;
const FIDE_PLAN_STRIPE_ID = environment.fide_id_plan_stripe_id;
const PREMIUM_PLAN_PRODUCT = environment.premium_plan_stripe_id;

export interface IPaygatePopupState {
  proSelected: boolean;
  fideSelected: boolean;
  email: string;
  token: string;
  isFirstTime?: boolean;
  currentStep?: string;
  fideForm?: IFideFormState;
  fideFormFilled?: boolean;
}

export interface IFideFormState {
  name?: string;
  surname?: string;
  year_of_birth?: number;
  place_of_birth?: number;
  nationality?: number;
  federation?: number;
  photo?: string;
  is_male?: boolean;
  email?: string;
  national_id_selfie?: string;
  fide_id?: number;
}

const defaultFideFormState: IFideFormState = {
  name: '',
  surname: '',
  year_of_birth: null,
  place_of_birth: null,
  nationality: null,
  federation: null,
  photo: null,
  is_male: null,
  email: '',
  national_id_selfie: '',
  fide_id: null
};

const defaultState: IPaygatePopupState = {
  proSelected: false,
  fideSelected: false,
  email: '',
  token: '',
  isFirstTime: false,
  currentStep: 'register',
  fideForm: defaultFideFormState,
  fideFormFilled: false
};

export interface IFideIdCredentials {
  full_name: string;
  fide_id?: number;
  nationality: number;
  federation: number;
  email: string;
  date_of_birth: string;
  place_of_birth: string;
  photo: any;
  gender?: 'male' | 'female';
}

export interface IExistingFideCredential {
  fide_id: number;
  photo: any;
}

export interface IFideSearchParams {
  fide_id_or_name?: string;
  year_of_birth: string;
}

@Injectable({ providedIn: 'root' })
export class PaygatePopupService implements OnDestroy {
  state$ = new ReplaySubject<IPaygatePopupState>(1);

  maxSteps$ = this.state$.pipe(
    filter(state => !!state),
    map((state: IPaygatePopupState) => {
      const { proSelected, fideSelected } = state;
      return 3 + (proSelected ? (fideSelected ? 2 : 1) : (fideSelected ? 2 : 0));
    }),
  );

  destroy$ = new Subject();

  proSelected$ = this.state$.pipe(
    map((state: IPaygatePopupState) => state ? state.proSelected : false),
  );

  fideSelected$ = this.state$.pipe(
    map((state: IPaygatePopupState) => state ? state.fideSelected : false),
  );

  isFirstTime$ = this.state$.pipe(
    map((state: IPaygatePopupState) => state ? state.isFirstTime : false),
  );

  token$ = new BehaviorSubject<string>(null);

  activation$ = new BehaviorSubject<IActivationCodeResponse>(null);

  products$ = new BehaviorSubject<ISpecialPlanProduct[]>(null);

  proProduct$ = this.products$.pipe(
    map((products: ISpecialPlanProduct[]) => {
      const proProduct = products ? products.find((p: ISpecialPlanProduct) => p.stripe_id === PRO_PLAN_STRIPE_ID) : null;
      return proProduct;
    }),
  );

  fideProduct$ = this.products$.pipe(
    map((products: ISpecialPlanProduct[]) => {
      const fideProduct = products ? products.find((p: ISpecialPlanProduct) => p.stripe_id === FIDE_PLAN_STRIPE_ID) : null;
      return fideProduct;
    }),
  );

  countries$ = new BehaviorSubject<ICountry[]>(null);

  email$ = new BehaviorSubject<string>(null);
  confirm$ = new BehaviorSubject<string>(null);
  stepLoaded$ = new BehaviorSubject<string>(null);

  popupOpened$ = new BehaviorSubject<boolean>(false);

  tournamentProduct$ = new BehaviorSubject<IProductWithExpand>(null);

  userPurchase$ = this.store$.pipe(
    select(selectUserPurchase)
  );

  activePlanSubscription$ = this.store$.pipe(
    select(selectActivePlanSubscription),
  );

  showFideId$ = this.store$.pipe(
    select(fromSubscriptions.selectFideIdPlan),
    map((subscription: ISubscription) => {
      return !subscription;
    }),
  );

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized),
  );

  account$ = this.store$.pipe(
    select(selectMyAccount),
  );

  constructor(private http: HttpClient,
    private store$: Store<fromUserPurchase.State>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private accountResourceService: AccountResourceService,
    private productResourceService: ProductResourceService,
    private countryResourceService: CountryResourceService,
    private paygateService: PaygateService,
    private paygatePopupManagerService: PaygatePopupManagerService
  ) {
    this.state$.next({ ...defaultState });
    this.loadState();
    activatedRoute.queryParamMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe((queryParams: ParamMap) => {
      const productId = queryParams.get('product');
      const product = this.tournamentProduct$.getValue();
      if (productId) {
        if (!product || product.stripe_id !== productId) {
          this.getTournamentProduct(productId);
        }
      }
    });
    this.getPlansProducts();
    this.getCountries();
    this.fideSelected$.pipe(
      takeUntil(this.destroy$),
      withLatestFrom(this.fideProduct$)
    ).subscribe(([fideSelected, fideProduct]) => {
      if (fideSelected) {
        this.paygateService.addToCart(fideProduct);
      } else {
        this.paygateService.removeFromCart(fideProduct);
      }
    });
    this.proSelected$.pipe(
      takeUntil(this.destroy$),
      withLatestFrom(this.proProduct$)
    ).subscribe(([proSelected, proProduct]) => {
      if (proSelected) {
        this.paygateService.addToCart(proProduct);
      } else {
        this.paygateService.removeFromCart(proProduct);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  loadState() {
    try {
      const state = JSON.parse(localStorage.getItem(PAYGATE_LOCAL_STORAGE_KEY));
      this.state$.next({ ...defaultState, ...state });
    } catch (e) {
      this.clearState();
    }
  }

  saveState() {
    this.state$.pipe(
      take(1),
    ).subscribe((state: IPaygatePopupState) => {
      localStorage.setItem(PAYGATE_LOCAL_STORAGE_KEY, JSON.stringify(state));
    });
  }

  clearState() {
    try {
      localStorage.removeItem(PAYGATE_LOCAL_STORAGE_KEY);
    } catch (e) {}
    this.state$.pipe(
      take(1),
    ).subscribe((state: IPaygatePopupState) => {
      this.state$.next({
        ...defaultState,
        isFirstTime: state.isFirstTime,
        proSelected: state.proSelected,
        fideSelected: state.fideSelected
      });
    });
  }

  setState(newState: Partial<IPaygatePopupState>) {
    this.state$.pipe(
      take(1),
    ).subscribe((state: IPaygatePopupState) => {
      this.state$.next({
        ...state,
        ...newState,
      });
      this.saveState();
    });
  }

  getPlansProducts() {
    this.http.get<ISpecialPlanProduct[]>(`${environment.endpoint}/plans/special_plans/`).pipe(
      take(1),
    ).subscribe((products: ISpecialPlanProduct[]) => {
      this.products$.next(products);
    });
  }

  getCountries() {
    this.countryResourceService.getAll().pipe(
      take(1)
    ).subscribe((countries: ICountry[]) => {
      this.countries$.next(countries);
    });
  }

  reset(withTumblers: boolean = false) {
    if (withTumblers) {
      this.setState({
        proSelected: false,
        fideSelected: false
      });
    }
    this.clearState();
    this.token$.next(null);
    this.activation$.next(null);
    this.stepLoaded$.next(null);
    this.email$.next(null);
    this.confirm$.next(null);
  }

  submitFide(data: IFideIdCredentials | IExistingFideCredential): Observable<any> {
    return this.http.post(`${environment.endpoint}/me/fide/`, data).pipe(
      tap(() => this.updateAccount()),
    );
  }

  closePopup(needResetTumblers: boolean = false) {
    if (needResetTumblers) {
      this.reset(needResetTumblers);
    }
    this.popupOpened$.next(false);
    this.isAuthorized$.pipe(
      take(1),
    ).subscribe((isAuthorized: boolean) => {
      if (isAuthorized) {
        this.updateAccount();
      }
      this.router.navigate(['', { outlets: { p: null } }]);
    });

  }

  private updateAccount() {
    this.accountResourceService.getProfile().pipe(
      takeUntil(this.destroy$)
    ).subscribe((a) => {
      this.store$.dispatch(new AddSubscriptions({
        subscriptions: a.subscriptions,
        count: a.subscriptions.length
      }));
      this.store$.dispatch(new AccountLoadSuccess({ account: a }));
    });
  }

  getTournamentProduct(stripeId: string) {
    this.productResourceService.get(stripeId).pipe(
      takeUntil(this.destroy$)
    ).subscribe((response) => {
      const productWithExpand: IProductWithExpand = <IProductWithExpand>({ ...response.product, tournament: response.tournament});
      this.tournamentProduct$.next(productWithExpand);
    });
  }

  navigateNextStep(current) {
    combineLatest([
      this.activatedRoute.queryParams,
      this.proSelected$,
      this.fideSelected$,
    ])
    .pipe(
      withLatestFrom(this.state$),
      take(1)
    ).subscribe(([some, state]) => {
      const [queryParams, proSelected, fideSelected] = some;
      const product = 'product' in queryParams ? queryParams['product'] : null;
      const upgrade = 'upgrade' in queryParams ? queryParams['upgrade'] : null;
      const downgrade = 'downgrade' in queryParams ? queryParams['downgrade'] : null;
      const plan = proSelected ? 'pro' : 'basic';

      switch (current) {
        case 'login': {
          if (product) {
            return this.userPurchase$.pipe(
              skipWhile(purchase => purchase === null),
              take(1),
            ).subscribe((purchase: IUserPurchase) => {
              if (purchase.products.indexOf(product) !== -1) {
                return this.router.navigate(['', {outlets: {p: null }}]);
              } else {
                return this.router.navigate(['', { outlets: { p: ['paygate', 'purchase'] } }], { queryParams });

              }
            });
          } else if (upgrade || downgrade) {
            return this.activePlanSubscription$.pipe(
              take(1),
            ).subscribe((activePlanSubscription: ISubscription) => {
              if (activePlanSubscription) {
                return this.router.navigate(['', { outlets: { p: null }}]);
              } else {
                return this.router.navigate(['', {
                  outlets: { p: ['paygate', 'payment'] } }], { queryParams: { upgrade: 'basic' } });
              }
            });
          } else {
            return this.router.navigate(['', {outlets: {p: null }}]);
          }
        }

        case 'register': {
          return this.router.navigate(['', { outlets: { p: ['paygate', 'confirm']} }], { queryParams });
        }

        case 'confirm': {
          return this.router.navigate(['', { outlets: { p: ['paygate', 'password'] } }], { queryParams });
        }

        case 'password': {
          if (fideSelected || plan !== 'basic') {
            return this.router.navigate(['', { outlets: { p: ['paygate', 'payment'] } }],  { queryParams });
          } else {
            if (product) {
              return this.router.navigate(['', { outlets: { p: ['paygate', 'purchase'] } }], { queryParams, fragment: 'tournament' });
            } else {
              return this.finishRegister();
            }
          }
        }

        case 'payment': {
          if (fideSelected || proSelected) {
            return this.account$.pipe(take(1)).subscribe((account: IAccount) => {
              if ((fideSelected) && account.fide_verified_status === null) {
                if (!state.fideFormFilled) {
                  return this.router.navigate(['', { outlets: { p: ['paygate', 'fide'] } }], { queryParams });
                } else {
                  return this.router.navigate(['', { outlets: { p: ['paygate', 'fide-verification'] } }], { queryParams });
                }
              } else {
                return this.paymentFinish(product, plan, queryParams);
              }
            });
          }

          return null;
        }

        case 'fide': {
          return this.router.navigate(['', { outlets: { p: ['paygate', 'fide-verification'] } }], { queryParams });
        }

        case 'fide-verification': {
          return this.paymentFinish(product, plan, queryParams);
        }

        case 'purchase': {
          return this.router.navigate(['', { outlets: { p: ['paygate', 'success'] } }], { queryParams });
        }

        case 'upgrade': {
          return this.router.navigate(['', { outlets: { p: ['paygate', 'payment'] } }], { fragment: 'upgrade' });
        }
      }
    });
  }

  paymentFinish(product, plan, queryParams) {
    if (product) {
      return this.userPurchase$.pipe(
        skipWhile(purchase => purchase === null),
        take(1),
      ).subscribe((purchase: IUserPurchase) => {
        switch (this.tournamentProduct$.getValue().tournament.broadcast_type) {
          case BroadcastType.ONLY_TICKET: {
            if (purchase.products.indexOf(product) !== -1) {
              return this.router.navigate(['', { outlets: { p: ['paygate', 'success'] } }], { queryParams });
            } else {
              return this.router.navigate(['', { outlets: { p: ['paygate', 'purchase'] } }], { queryParams, fragment: 'tournament' });
            }
          }

          case BroadcastType.PAY: {
            if (plan === 'basic') {
              return this.router.navigate(['', { outlets: { p: ['paygate', 'purchase'] } }], { queryParams, fragment: 'tournament' });
            } else {
              return this.router.navigate(['', { outlets: { p: ['paygate', 'success'] } }], { queryParams });
            }
          }

          case BroadcastType.FREE: {
            return this.router.navigate(['', { outlets: { p: ['paygate', 'success'] } }], { queryParams });
          }
        }
      });
    } else {
      return this.finishRegister();
    }
  }

  finishRegister() {
    this.store$.dispatch(new AccountRefresh());
    this.reset(true);
    const primaryRoute: ActivatedRouteSnapshot = this.activatedRoute.snapshot.children
      .find((route) => (route.outlet === 'primary'));
    if (primaryRoute.url && primaryRoute.url.length) {
      if (this.router.url.indexOf('account/membership') === -1) {
        this.setState({ isFirstTime: false });
      }
      return this.router.navigate(['', { outlets: { p: null } }]);
    }

    if (window.location.href.indexOf(environment.gameUrl) > -1) {
      this.paygatePopupManagerService.crossAppNavigate(false, '/account/membership', false);
    } else {
      return this.router.navigate(['/account/membership'])
        .then(() => this.router.navigate([{ outlets: { p: null } }]));
    }
  }
}
