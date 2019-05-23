import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { skipWhile, take } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { IActivationCodeResponse } from '../../../auth/auth.model';
import { ISpecialPlanProduct } from '../models';
import { ICountry } from '../../../broadcast/core/country/country.model';
import { SubscriptionHelper, Subscriptions } from '../../../shared/helpers/subscription.helper';
import { IProductWithExpand } from '@app/purchases/product/product.model';
import { ProductResourceService } from '@app/purchases/product/product-resource.service';
import * as fromUserPurchase from '@app/purchases/user-purchases/user-purchases.reducer';
import { selectUserPurchase } from '@app/purchases/user-purchases/user-purchases.reducer';
import { IUserPurchase } from '@app/purchases/user-purchases/user-purchases.model';
import { BroadcastType } from '@app/broadcast/core/tournament/tournament.model';


export type PlanType = 'basic' | 'pro' | 'premium' | 'tournament';

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

@Injectable()
export class PaygatePopupService implements OnDestroy {
  subs: Subscriptions = {};

  plan$ = new BehaviorSubject<PlanType>(null);

  fideSelected$ = new BehaviorSubject<boolean>(true);

  token$ = new BehaviorSubject<string>(null);

  activation$ = new BehaviorSubject<IActivationCodeResponse>(null);

  products$ = new BehaviorSubject<ISpecialPlanProduct[]>(null);

  countries$ = new BehaviorSubject<ICountry[]>(null);

  email$ = new BehaviorSubject<string>(null);

  popupOpened$ = new BehaviorSubject<boolean>(false);

  tournamentProduct$ = new BehaviorSubject<IProductWithExpand>(null);

  userPurchase$ = this.store$.pipe(
    select(selectUserPurchase)
  );

  constructor(private http: HttpClient,
    private store$: Store<fromUserPurchase.State>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private productResourceService: ProductResourceService) {
    this.subs.fragment = this.activatedRoute.fragment.subscribe((fragment) => {
      this.plan$.next(['basic', 'pro', 'premium', 'tournament'].indexOf(fragment) !== -1 ? <PlanType>fragment : null);
    });
    this.subs.query = activatedRoute.queryParamMap.subscribe((queryParams: ParamMap) => {
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
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  getPlansProducts() {
    this.http.get<ISpecialPlanProduct[]>(`${environment.endpoint}/plans/special_plans/`).pipe(
      take(1),
    ).subscribe((products: ISpecialPlanProduct[]) => {
      this.products$.next(products);
    });
  }

  getCountries() {
    this.http.get<ICountry[]>(`${environment.endpoint}/countries/`).pipe(
      take(1)
    ).subscribe((countries) => {
      this.countries$.next(countries);
    });
  }

  reset() {
    this.fideSelected$.next(false);
    this.token$.next(null);
    this.activation$.next(null);
    this.email$.next(null);
  }

  submitFide(data: IFideIdCredentials): Observable<any> {
    return this.http.post(`${environment.endpoint}/me/fide/`, data);
  }

  closePopup() {
    this.reset();
    this.popupOpened$.next(false);
    this.router.navigate(['', { outlets: { p: null } }]);
  }

  getTournamentProduct(stripeId: string) {
    this.productResourceService.get(stripeId).subscribe((response) => {
      const productWithExpand: IProductWithExpand = <IProductWithExpand>({ ...response.product, tournament: response.tournament});
      this.tournamentProduct$.next(productWithExpand);
    });
  }

  navigateNextStep(current) {
    this.activatedRoute.queryParams.pipe(
      take(1),
    ).subscribe((queryParams) => {
      switch (current) {
        case 'login': {
          const product = 'product' in queryParams ? queryParams['product'] : null;
          if (product) {
            return this.userPurchase$.pipe(
              skipWhile(purchase => purchase === null),
              take(1),
            ).subscribe((purchase: IUserPurchase) => {
              if (purchase.products.indexOf(product) !== -1) {
                return this.router.navigate(['', {outlets: {p: null }}]);
              } else {
                return this.router.navigate(['', { outlets: { p: ['paygate', 'purchase'] } }], { queryParams, fragment: 'tournament' });

              }
            });
          } else {
            return this.router.navigate(['', {outlets: {p: null }}]);
          }
        }

        case 'register': {
          const fragment = ['basic', 'pro', 'premium'].indexOf(this.plan$.getValue()) !== -1 ? this.plan$.getValue() : undefined;
          return this.router.navigate(['', { outlets: { p: ['paygate', 'confirm']} }], { queryParams, fragment });
        }

        case 'confirm': {
          const fragment = ['basic', 'pro', 'premium'].indexOf(this.plan$.getValue()) !== -1 ? this.plan$.getValue() : undefined;
          return this.router.navigate(['', { outlets: { p: ['paygate', 'password'] } }], { queryParams, fragment });
        }

        case 'password': {
          const fideSelected: boolean = this.fideSelected$.getValue();
          const plan = this.plan$.getValue();
          if (fideSelected || plan !== 'basic') {
            const fragment = ['basic', 'pro', 'premium'].indexOf(this.plan$.getValue()) !== -1 ? this.plan$.getValue() : undefined;
            return this.router.navigate(['', { outlets: { p: ['paygate', 'payment'] } }],  { queryParams, fragment });
          } else {
            const product = 'product' in queryParams ? queryParams['product'] : null;
            if (product) {
              return this.router.navigate(['', { outlets: { p: ['paygate', 'purchase'] } }], { queryParams, fragment: 'tournament' });
            } else {
              return this.router.navigate(['', { outlets: { p: ['paygate', 'success'] } }], { queryParams });
            }
          }
        }

        case 'payment': {
          const fideSelected = this.fideSelected$.getValue();
          const product = 'product' in queryParams ? queryParams['product'] : null;
          const plan = this.plan$.getValue();
          if (fideSelected || plan === 'premium') {
            return this.router.navigate(['', { outlets: { p: ['paygate', 'fide'] } }], { queryParams });
          } else {
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
                      return this.router.navigate(['', { outlets: { p: ['paygate', 'purchase'] } }], {
                        queryParams, fragment: 'tournament'
                      });
                    }
                  }

                  case BroadcastType.PAY: {
                    if (plan === 'basic') {
                      return this.router.navigate(['', { outlets: { p: ['paygate', 'purchase'] } }], {
                        queryParams, fragment: 'tournament'
                      });
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
              return this.router.navigate(['', { outlets: { p: ['paygate', 'success'] } }], { queryParams });
            }
          }
        }

        case 'fide': {
          const product = 'product' in queryParams ? queryParams['product'] : null;
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
                  const plan = this.plan$.getValue();
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
            return this.router.navigate(['', { outlets: { p: ['paygate', 'success'] } }], { queryParams });
          }
        }

        case 'purchase': {
          return this.router.navigate(['', { outlets: { p: ['paygate', 'success'] } }], { queryParams });
        }
      }
    });
  }
}
