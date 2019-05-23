import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {AuthModule} from '../auth/auth.module';
import {PartnersModule} from '../partners/partners.module';
import {SharedModule} from '../shared/shared.module';
import {FooterComponent} from './footer/footer.component';
import {LayoutComponent} from './layout.component';
import {NavComponent} from './nav/nav.component';
import {PopupComponent} from './popup/popup.component';
import {UnauthorizedComponent} from './unauthorized/unauthorized.component';
import {RouterModule} from '@angular/router';
import { UserNavComponent } from './user-nav/user-nav.component';
import { NotificationsModule } from '../notifications/notifications.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    AuthModule,
    PartnersModule,
    NotificationsModule,
  ],
  providers: [],
  declarations: [
    NavComponent,
    PopupComponent,
    FooterComponent,
    UnauthorizedComponent,
    LayoutComponent,
    UserNavComponent,
  ],
  exports: [
    NavComponent,
    UserNavComponent,
    LayoutComponent,
    FooterComponent
  ]
})
export class LayoutModule {
}
