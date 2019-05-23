import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { PlanType } from '../choose-plan/choose-plan.component';;


export interface IPaygateEmbeddedData {
  title: string;
  price: number;
  stripeId: string;
  isPlan: boolean;
  planType: PlanType;
}

@Injectable()
export class PaygateEmbeddedService {
  private _paygateData = new Subject<IPaygateEmbeddedData>();
  private _isShowPaygate = new Subject<boolean>();
  private _buyCompleted = new Subject<boolean>();

  paygateData$: Observable<IPaygateEmbeddedData> = this._paygateData.asObservable();
  isShowPaygate$: Observable<boolean> = this._isShowPaygate.asObservable();
  buyCompleted$: Observable<boolean> = this._buyCompleted.asObservable();

  showPaygate(title: string, price: number, stripeId: string , isPlan: boolean = true, planType: PlanType = PlanType.BASIC) {
    this._paygateData.next(<IPaygateEmbeddedData>{
      title,
      price,
      stripeId,
      isPlan,
      planType
    });
    this._isShowPaygate.next(true);
  }

  buyComplete(ok: boolean = true) {
    this._paygateData.next(<IPaygateEmbeddedData>{
      title: null,
      price: null,
      stripeId: null,
      isPlan: true,
      planType: PlanType.BASIC,
    });
    this._isShowPaygate.next(false);
    this._buyCompleted.next(ok);
  }
}