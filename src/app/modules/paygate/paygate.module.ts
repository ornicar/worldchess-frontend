import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask';
import { IndexComponent } from './components/index/index.component';
import { LoginComponent } from './components/login/login.component';
import { LogoComponent } from './components/left-side/logo/logo.component';
import { FreeComponent } from './components/left-side/free/free.component';
import { RegisterComponent } from './components/register/register.component';
import { ProComponent } from './components/left-side/pro/pro.component';
import { PremiumComponent } from './components/left-side/premium/premium.component';
import { WithFideComponent } from './components/left-side/with-fide/with-fide.component';
import { SubscriptionMenuComponent } from './components/left-side/subscription-menu/subscription-menu.component';
import { AuthResourceService } from '../../auth/auth-resource.service';
import { RecoverComponent } from './components/recover/recover.component';
import { PasswordComponent } from './components/password/password.component';
import { PaymentComponent } from './components/payment/payment.component';
import { SuccessComponent } from './components/success/success.component';
import { FideFormComponent } from './components/fide/fide.component';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { PaygatePopupService } from './services/paygate-popup.service';
import { FormHelperModule } from '../../form-helper/form-helper.module';
import { PurchaseComponent } from './components/purchase/purchase.component';
import { TournamentPurchaseComponent } from './components/left-side/tournament/tournament.component';
// Debug component (remove after development finished)
import { PaygateDebugComponent } from './components/debug/debug.component';
import { WidgetsModule } from '@app/shared/widgets/widgets.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormHelperModule,
    NgxMaskModule.forRoot(),
    RouterModule.forChild([
      {
        path: '',
        component: IndexComponent,
        children: [
          {
            path: 'login',
            component: LoginComponent,
          },
          {
            path: 'register',
            component: RegisterComponent,
          },
          {
            path: 'recover',
            component: RecoverComponent,
          },
          {
            path: 'password',
            component: PasswordComponent,
          },
          {
            path: 'success',
            component: SuccessComponent,
          },
          {
            path: 'payment',
            component: PaymentComponent,
          },
          {
            path: 'fide',
            component: FideFormComponent,
          },
          {
            path: 'confirm',
            component: ConfirmComponent,
          },
          {
            path: 'purchase',
            component: PurchaseComponent,
          }
        ],
      },
    ]),
    WidgetsModule,
  ],
  declarations: [
    IndexComponent,
    LoginComponent,
    LogoComponent,
    FreeComponent,
    RegisterComponent,
    ProComponent,
    PremiumComponent,
    WithFideComponent,
    SubscriptionMenuComponent,
    RecoverComponent,
    PasswordComponent,
    SuccessComponent,
    PaymentComponent,
    FideFormComponent,
    PaygateDebugComponent,
    ConfirmComponent,
    PurchaseComponent,
    TournamentPurchaseComponent,
  ],
  providers: [
    AuthResourceService,
    PaygatePopupService
  ],
})
export class PaygateModule {}
