import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Angulartics2Module } from 'angulartics2';
import { LayoutModule } from '../layout/layout.module';
import { SharedModule } from '../shared/shared.module';
import { PaygatePageComponent } from './paygate-page.component';
import { BuyComponent } from './checkout/purchase/buy/buy.component';
import { PremiumFeaturesComponent } from './premium-features/premium-features.component';
import { PaygateSubsComponent } from './paygate-subs/paygate-subs.component';
import { FormHelperModule } from '../form-helper/form-helper.module';
import { AuthComponent } from './checkout/purchase/auth/auth.component';
import { BuyObserver } from './buy-observer';
import { CheckoutComponent } from './checkout/checkout.component';
import { PurchaseComponent } from './checkout/purchase/purchase.component';
import { ChoosePlanComponent } from './choose-plan/choose-plan.component';
import { PaymentInfoFormComponent } from './payment-info-form/payment-info-form.component';
import { SelectedPlanComponent } from './selected-plan/selected-plan.component';
import { PaygateEmbeddedComponent } from './paygate-embedded/paygate-embedded.component';
import { PaygateEmbeddedService } from './paygate-embedded/paygate-embedded.service';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormHelperModule,
    SharedModule,
    Angulartics2Module,
    LayoutModule,
  ],
  declarations: [
    PaygatePageComponent,
    PaygateSubsComponent,
    PremiumFeaturesComponent,
    BuyComponent,
    AuthComponent,
    CheckoutComponent,
    PurchaseComponent,
    ChoosePlanComponent,
    PaymentInfoFormComponent,
    SelectedPlanComponent,
    PaygateEmbeddedComponent
  ],
  providers: [
    BuyObserver,
    PaygateEmbeddedService
  ],
  exports: [
    PaygatePageComponent,
    CheckoutComponent,
    ChoosePlanComponent,
    PaymentInfoFormComponent,
    SelectedPlanComponent,
    PaygateEmbeddedComponent
  ]
})
export class PaygateModule {
}
