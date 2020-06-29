import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as forRoot from '../../../reducers/index';
import { UserPurchasesService } from '@app/purchases/user-purchases/user-purchases.service';
import { selectMainSelling } from '@app/purchases/selling/selling.reducer';
import { IMainSelling } from '@app/purchases/selling/selling.model';
import { IPlan } from '@app/purchases/plan/plan.model';
import { IProductWithExpand } from '@app/purchases/product/product.model';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';


@Component({
  selector: 'wc-purchases-banner',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.scss']
})
export class PurchasesComponent implements OnInit {
  constructor(
    private store$: Store<forRoot.State>,
    private userPurchases: UserPurchasesService,
    private paygatePopupManagerService: PaygatePopupManagerService) {
  }

  availableSelling$: Observable<IMainSelling> = this.store$.pipe(
    select(selectMainSelling)
  );

  product$ = this.availableSelling$.pipe(
    map((selling: IMainSelling) => {
      if (selling) {
        return selling.main_product;
      } else {
        return null;
      }
    })
  );

  plan$ = this.availableSelling$.pipe(
    map((selling: IMainSelling) => {
      if (selling) {
        return selling.main_plan;
      } else {
        return null;
      }
    })
  );

  hasProduct$: Observable<boolean> = this.product$.pipe(
    switchMap((product) => {
      if (product) {
        return this.userPurchases.hasUserProduct(product.stripe_id);
      } else {
        return of(false);
      }
    })
  );

  hasPlan$: Observable<boolean> = this.plan$.pipe(
    switchMap((plan: IPlan) => {
      if (plan) {
        return  this.userPurchases.hasUserPlan(plan.stripe_id);
      } else {
        return of(false);
      }
    })
  );

  ngOnInit() {
  }

  onBuyProduct(product: IProductWithExpand) {
    this.paygatePopupManagerService.openPaygatePopupWithPurchase(product.stripe_id);
  }

  onBuyPlan(plan: IPlan) {
    this.paygatePopupManagerService.openPaygatePopupWithPlanPayment(plan.name.toLowerCase());
  }
}
