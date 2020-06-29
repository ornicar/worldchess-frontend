import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';

import { ICard, IChargePlanRequest, IChargeProductRequest, ICouponResponse, ISpecialPlanProduct } from '@app/modules/paygate/models';
import { environment } from '../../../../environments/environment';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface IPaygateCart {
  products: IPaygateCartItem[];
  cartPromoCode: string;
  total: number;
}

const defaultCartState: IPaygateCart = {
  products: [],
  cartPromoCode: '',
  total: 0
};

export interface IPaygateCartItem {
  product: ISpecialPlanProduct;
  coupon?: ICouponResponse;
  total: number;
}

const PRO_PLAN_STRIPE_ID = environment.pro_plan_stripe_id;
const FIDE_PLAN_STRIPE_ID = environment.fide_id_plan_stripe_id;

@Injectable({ providedIn: 'root' })
export class PaygateService {
  constructor(private httpClient: HttpClient) {
  }

  cart = new BehaviorSubject<IPaygateCart>(defaultCartState);

  addToCart(item: ISpecialPlanProduct) {
    if (!this.inCart(item) && item) {
      this.cart.next({
        ...this.cart.value,
        products: [...this.cart.value.products, {
          product: item,
          coupon: null,
          total: item.amount
        }]
      });
      this.calcTotal();
    }
  }

  removeFromCart(item: ISpecialPlanProduct) {
    const removeIndex = this.inCartIndex(item);
    if (removeIndex > -1 && item) {
      this.cart.next({
        ...this.cart.value,
        products: [
          ...this.cart.value.products.slice(0, removeIndex),
          ...this.cart.value.products.slice(removeIndex + 1),
        ]
      });
      this.calcTotal();
    }
  }

  calcTotal(): number {
    let total = 0;
    this.cart.value.products.forEach((product) => {
      product.total = product.product.amount;
      if (product.coupon) {
        if (product.coupon.percentOff && product.coupon.percentOff > 0) {
          product.total -= product.total * product.coupon.percentOff / 100;
        }
        if (product.coupon.amountOff && product.coupon.amountOff > 0) {
          product.total -= product.coupon.amountOff;
        }
      }
      total += product.total;
    });
    this.cart.next({
      ...this.cart.value,
      total
    });
    return total;
  }

  calcTotalForGtag(): string {
    let total = 0;
    this.cart.value.products.forEach((product) => {
      product.total = product.product.amount;
      total += product.total;
    });

    if (total) {
      return (total / 100).toString();
    }

    return 'free';
  }

  calcTotalWithCouponForGtag(): string {
    let total = 0;
    let couponApplied = false;
    this.cart.value.products.forEach((product) => {
      product.total = product.product.amount;
      if (product.coupon) {
        if (product.coupon.percentOff && product.coupon.percentOff > 0) {
          couponApplied = true;
          product.total -= product.total * product.coupon.percentOff / 100;
        }
        if (product.coupon.amountOff && product.coupon.amountOff > 0) {
          couponApplied = true;
          product.total -= product.coupon.amountOff;
        }
      }
      total += product.total;
    });

    if (couponApplied) {
      return 'coupon ' + (total / 100).toString();
    }

    return null;
  }

  applyPromoCode(promoCode: string) {
    return forkJoin(
      this.cart.value.products.map((product) => {
        return this.checkPromoCode(promoCode, product.product.stripe_id)
          .pipe(catchError(() => {
            return of({
              valid: false
            } as ICouponResponse);
          }));
      })
    ).pipe(
      map((coupons) => {
        let wasApplied = false;
        if (coupons) {
          wasApplied = coupons.findIndex((coupon) => coupon.valid) > -1;
          const newProducts = [...this.cart.value.products];
          coupons.forEach((coupon, index) => {
            if (coupon.valid) {
              newProducts[index].coupon = coupon;
            } else if (wasApplied) {
              newProducts[index].coupon = null;
            }
          });

          this.cart.next({
            ...this.cart.value,
            products: newProducts
          });

          this.calcTotal();
        }

        return wasApplied;
      })
    );
  }

  buy(cardData: ICard) {
    return forkJoin(
      this.cart.value.products.map(() => {
        return this.getPayToken(cardData);
      })
    ).pipe(
      switchMap((stripeTokens) => {
        const planRequests: Observable<any>[] = [];
        if (stripeTokens) {
          stripeTokens.forEach((token, index) => {
            const plan: IChargePlanRequest = {
              stripeToken: token,
              plan: this.cart.value.products[index].product.stripe_id,
            };
            if (this.cart.value.products[index].coupon) {
              plan.coupon = this.cart.value.products[index].coupon.id;
            }

            planRequests.push(this.buyPlan(plan));
          });
        }

        return forkJoin(planRequests);
      })
    );
  }

  inCart(item: ISpecialPlanProduct) {
    return item && this.cart.value.products.find((cartItem) => {
      return cartItem.product.stripe_id === item.stripe_id;
    });
  }

  inCartIndex(item: ISpecialPlanProduct) {
    return item
      ? this.cart.value.products.findIndex((cartItem) => {
          return cartItem.product.stripe_id === item.stripe_id;
        })
      : -1;
  }

  getPayToken(card: ICard): Observable<string> {
    let data = new HttpParams();
    data = data.append('card[number]', card.number);
    data = data.append('card[exp_month]', card.expMonth);
    data = data.append('card[exp_year]', card.expYear);
    data = data.append('card[cvc]', card.cvc);
    data = data.append('card[name]', card.name);

    return this.httpClient.post<string>('https://api.stripe.com/v1/tokens', data, {
      headers: {
        'Authorization': `Bearer ${environment.stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .pipe(
        map(response => <string> response['id'])
      );
  }

  checkPromoCode(coupon: string, plan?: string)  {
    return this.httpClient.post<ICouponResponse>(
      `${environment.endpoint}/coupon/`,
      { coupon, plan }
    );
  }

  buyProduct(productRequest: IChargeProductRequest) {
    return this.httpClient.post(
      `${environment.endpoint}/charge/product/`,
      productRequest
    );
  }

  buyPlan(planRequest: IChargePlanRequest) {
    return this.httpClient.post(
      `${environment.endpoint}/charge/plan/`,
      planRequest
    );
  }
}
