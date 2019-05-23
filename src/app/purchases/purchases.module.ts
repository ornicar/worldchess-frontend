import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {HttpClientModule} from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { PlanEffects } from './plan/plan.effects';
import { ProductEffects } from './product/product.effects';
import { EffectsModule } from '@ngrx/effects';
import { UserPurchasesEffects } from './user-purchases/user-purchases.effects';
import * as fromPlan from './plan/plan.reducer';
import * as fromProduct from './product/product.reducer';
import * as fromUserPurchases from './user-purchases/user-purchases.reducer';
import * as fromSelling from './selling/selling.reducer';
import { UserPurchasesResourceService } from './user-purchases/user-purchases-resource.service';
import { ProductResourceService } from './product/product-resource.service';
import { PlanResourceService } from './plan/plan-resource.service';
import { SellingResourceService } from './selling/selling-resource.service';
import { SellingEffects } from './selling/selling.effects';
import { UserPurchasesService } from './user-purchases/user-purchases.service';
import * as fromSubscription from './subscriptions/subscriptions.reducer';
import { SubscriptionsResourceService } from './subscriptions/subscriptions-resource.service';
import { SubscriptionsEffects } from './subscriptions/subscriptions.effects';
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    StoreModule.forFeature('plan', fromPlan.reducer),
    StoreModule.forFeature('product', fromProduct.reducer),
    StoreModule.forFeature('user-purchase', fromUserPurchases.reducer),
    StoreModule.forFeature('selling', fromSelling.reducer),
    StoreModule.forFeature('subscription', fromSubscription.reducer),
    EffectsModule.forFeature([
      PlanEffects,
      ProductEffects,
      UserPurchasesEffects,
      SellingEffects,
      SubscriptionsEffects
    ])
  ],
  declarations: [
  ],
  providers: [
    PlanResourceService,
    ProductResourceService,
    UserPurchasesResourceService,
    UserPurchasesService,
    SellingResourceService,
    SubscriptionsResourceService
  ],
  exports: [
  ]
})
export class PurchasesModule {
}
