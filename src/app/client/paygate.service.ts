import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {IChargePlanRequest, IChargeProductRequest} from '../paygate/dto/buy-request';
import {Card} from '../paygate/dto/card';
import {ICouponResponse} from '../paygate/dto/promo-code';

@Injectable()
export class PaygateService {

  constructor(private httpClient: HttpClient) {
  }

  getPayToken(card: Card): Observable<string> {
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

  checkPromoCode(coupon: string, sku?: string)  {
    return this.httpClient.post<ICouponResponse>(
      `${environment.endpoint}/coupon/`,
      { coupon, sku }
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
