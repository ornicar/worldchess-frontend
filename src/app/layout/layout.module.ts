import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PartnersModule } from '../partners/partners.module';
import { SharedModule } from '../shared/shared.module';
import { FooterComponent } from './footer/footer.component';
import { LayoutComponent } from './layout.component';
import { NavComponent } from './nav/nav.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { RouterModule } from '@angular/router';
import { UserNavComponent } from './user-nav/user-nav.component';
import { NotificationsModule } from '../notifications/notifications.module';
import { MainBroadcastNavComponent } from '@app/pages/main-page/main-broadcast-nav/main-broadcast-nav.component';
import { HeaderModule } from '@app/broadcast/components/header/header.module';
import { SvgModule } from '@app/modules/svg/svg.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    PartnersModule,
    NotificationsModule,
    HeaderModule,
    SvgModule
  ],
  providers: [],
  declarations: [
    NavComponent,
    FooterComponent,
    UnauthorizedComponent,
    LayoutComponent,
    UserNavComponent,
    MainBroadcastNavComponent,
  ],
  exports: [
    NavComponent,
    UserNavComponent,
    LayoutComponent,
    FooterComponent,
    MainBroadcastNavComponent,
  ]
})
export class LayoutModule {
}
