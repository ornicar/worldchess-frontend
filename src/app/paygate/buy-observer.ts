import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable()
export class BuyObserver {

  private emitBuy = new Subject<boolean>();
  private emitCoupon = new Subject<boolean>();

  /**
   * @deprecated
   */
  public couponObs = this.emitCoupon.asObservable();

  /**
   * @deprecated
   */
  public buyObs = this.emitBuy.asObservable();

  /**
   * @deprecated
   */
  emitBuyStart(next: boolean) {
    this.emitBuy.next(next);
  }

  /**
   * @deprecated
   */
  emitCouponStart(next: boolean) {
    this.emitCoupon.next(next);
  }
}
