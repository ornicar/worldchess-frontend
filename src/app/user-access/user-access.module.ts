import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule, MatIconModule, MatInputModule } from '@angular/material';
import { LayoutModule } from '../layout/layout.module';
import { AccountActivateComponent } from './account-activate/account-activate.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { RestoreComponent } from './restore/restore.component';
import { SocialSignInComponent } from './social-sign-in/social-sign-in.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { TwitterAuthComponent } from './twitter-auth/twitter-auth.component';
import { FormHelperModule } from '../form-helper/form-helper.module';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { FacebookAuthComponent } from './facebook-auth/facebook-auth.component';
import { AccountRestoreComponent } from './account-restore/account-restore.component';
import { PassportComponent } from './sign-up/passport/passport.component';
import { PaygateModule } from '../paygate/paygate.module';
import { FacebookAuthDirective } from './facebook-auth/facebook-auth.directive';
import { TwitterAuthDirective } from './twitter-auth/twitter-auth.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    FormHelperModule,
    RouterModule,
    LayoutModule,
    PaygateModule,
  ],
  declarations: [
    SignUpComponent,
    SocialSignInComponent,
    SignInComponent,
    RestoreComponent,
    TwitterAuthComponent,
    WelcomePageComponent,
    FacebookAuthComponent,
    AccountRestoreComponent,
    AccountActivateComponent,
    FacebookAuthDirective,
    TwitterAuthDirective,
    AccountActivateComponent,
    PassportComponent
  ],
  exports: [
    TwitterAuthComponent,
    FacebookAuthComponent,
    FacebookAuthDirective,
    TwitterAuthDirective
  ]
})
export class UserAccessModule {
}
