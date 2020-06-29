import { HammerGestureConfig, HAMMER_GESTURE_CONFIG, BrowserModule } from '@angular/platform-browser';
import { Injectable, NgModule, NgModuleFactoryLoader, SystemJsNgModuleLoader } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleTagManager } from 'angulartics2/gtm';
import { EmbeddedWidgetModule } from './embedded-widget/embedded-widget.module';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { BroadcastModule } from './broadcast/broadcast.module';
import { HeaderModule } from './broadcast/components/header/header.module';
import { CoreModule } from './broadcast/core/core.module';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { MainPageTournamentBannerComponent } from './pages/main-page/tournament-banner/tournament-banner.component';
import { PartnershipModule } from './pages/partnership-page/partnership.module';
import { RbccPageComponent } from './pages/partnership-page/rbcc/rbcc-page.component';
import { AppRoutingModule } from './app-routing.module';
import { PurchasesComponent } from './pages/main-page/purchases/purchases.component';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormHelperModule } from './form-helper/form-helper.module';
import { UserService } from './client/user.service';
import { CookieModule } from 'ngx-cookie';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { metaReducers, reducers } from './reducers';
import 'moment-duration-format';
import { MatesPopupComponent } from './components/mates-popup/mates-popup.component';
import { PartnersModule } from './partners/partners.module';
import { WidgetsListModule } from './pages/widgets-list-page/widgets-list.module';
import { WidgetModule } from '../widget/app/widget.module';
import { LayoutModule } from './layout/layout.module';
import { MainPageWidgetComponent } from './pages/main-page/widget/widget.component';
import { MainPageNewsBannerComponent } from './pages/main-page/news-banner/news-banner.component';
import { MainPageShopBannerComponent } from './pages/main-page/shop-banner/shop-banner.component';
import { MainPageVideoBannerComponent } from './pages/main-page/video-banner/video-banner.component';
import { MainPageWidgetBannerComponent } from './pages/main-page/widget-banner/widget-banner.component';
import * as fromMainPage from './pages/main-page/store/main-page.reducer';
import { MainPageResourceService } from './pages/main-page/store/main-page-resource.service';
import { MainPageEffects } from './pages/main-page/store/main-page.effects';
import { VideoBannerPlayerComponent } from './pages/main-page/video-banner/video-player/video-player.component';
import { BannerWrapperComponent } from './pages/main-page/banner-wrapper/banner-wrapper.component';
import { PurchasesModule } from './purchases/purchases.module';
import { MiniBannerComponent } from './pages/main-page/mini-banner/mini-banner.component';
import { SecondBannersComponent } from './pages/main-page/second-banners/second-banners.component';
import { ComponentsModule } from './components/components.module';
import { MainBroadcastListModule } from './pages/main-page/main-broadcast-list/main-broadcast-list.module';
import { AccountStoreModule } from './account/account-store/account-store.module';
import { NgxsModule, NoopNgxsExecutionStrategy } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { AppNotFoundRoutingModule } from '@app/app-not-found-routing.module';
import { NguCarouselModule } from '@ngu/carousel';
import { ScreenModule } from '@app/shared/screen/screen.module';
import * as fromHeader from '@app/broadcast/components/header/header.reducer';
import { HeaderEffects } from '@app/broadcast/components/header/header.effects';
import { SvgModule } from '@app/modules/svg/svg.module';
import { IsMainApp } from '@app/is-main-app.token';

@Injectable()
export class CustomHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    'pinch': {enable: false},
    'rotate': {enable: false}
  };
}

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    RbccPageComponent,
    PurchasesComponent,
    MatesPopupComponent,
    MainPageWidgetComponent,
    MainPageNewsBannerComponent,
    MainPageShopBannerComponent,
    MainPageVideoBannerComponent,
    MainPageTournamentBannerComponent,
    MainPageWidgetBannerComponent,
    VideoBannerPlayerComponent,
    BannerWrapperComponent,
    MatesPopupComponent,
    MiniBannerComponent,
    SecondBannersComponent
  ],
  imports: [
    AppRoutingModule,
    AuthModule,
    CoreModule.forRoot(),
    ScreenModule.forRoot(),
    LayoutModule,
    HeaderModule,
    BroadcastModule,
    AppRoutingModule,
    PartnershipModule,
    WidgetModule,
    BrowserAnimationsModule,
    FormHelperModule,
    CookieModule.forRoot(),
    HttpClientModule,
    FormsModule,
    MatIconModule,
    SharedModule,
    PartnersModule,
    WidgetsListModule,
    StoreModule.forRoot(reducers, {metaReducers}),
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    Angulartics2Module.forRoot([Angulartics2GoogleTagManager]),
    StoreModule.forFeature('main-page', fromMainPage.reducer),
    EffectsModule.forFeature([MainPageEffects]),
    StoreModule.forFeature('header', fromHeader.reducer),
    EffectsModule.forFeature([
      HeaderEffects
    ]),
    PurchasesModule,
    EmbeddedWidgetModule,
    MatDialogModule,
    ComponentsModule,
    MainBroadcastListModule,
    AccountStoreModule,
    NgxsModule.forRoot([], {
      developmentMode: !environment.production,
      executionStrategy: NoopNgxsExecutionStrategy,
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      name: 'NGXS store',
      disabled: environment.production,
    }),
    AppNotFoundRoutingModule,
    NguCarouselModule,
    SvgModule
  ],
  providers: [
    UserService,
    {provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig},
    { provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader },
    MainPageResourceService,
    {
      provide: IsMainApp,
      useValue: true,
    },
  ],
})
export class AppModule {
}
