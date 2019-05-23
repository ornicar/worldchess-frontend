import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { Injectable, NgModule } from '@angular/core';
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
import { GamingModule } from './gaming/gaming.module';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { MainPageTournamentBannerComponent } from './pages/main-page/tournament-banner/tournament-banner.component';
import { PartnershipModule } from './pages/partnership-page/partnership.module';
import { RbccPageComponent } from './pages/partnership-page/rbcc/rbcc-page.component';
import { AppRoutingModule } from './app-routing.module';
import { NewsModule } from './news/news.module';
import { PurchasesComponent } from './pages/main-page/purchases/purchases.component';
import { RatingComponent } from './pages/main-page/rating/rating.component';
import { SharedModule } from './shared/shared.module';
import { TvModule } from './tv-view/tv.module';
import { UserAccessModule } from './user-access/user-access.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavObserver } from './nav-observer';
import { HttpClientModule } from '@angular/common/http';
import { FormHelperModule } from './form-helper/form-helper.module';
import { PaygateModule } from './paygate/paygate.module';
import { AuthService } from './client/auth.service';
import { UserService } from './client/user.service';
import { CookieModule } from 'ngx-cookie';
import { PaygateService } from './client/paygate.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatDialogModule } from '@angular/material';
import { metaReducers, reducers } from './reducers';
import 'moment-duration-format';
import { MatesPopupComponent } from './components/mates-popup/mates-popup.component';
import { PartnersModule } from './partners/partners.module';
import { WidgetsListModule } from './pages/widgets-list-page/widgets-list.module';
import { WidgetModule } from '../widget/app/widget.module';
import { LayoutModule } from './layout/layout.module';
import { MainBroadcastNavComponent } from './pages/main-page/main-broadcast-nav/main-broadcast-nav.component';
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
import { RatingModule } from './pages/rating-page/rating.module';
import { PurchasesModule } from './purchases/purchases.module';
import { MiniBannerComponent } from './pages/main-page/mini-banner/mini-banner.component';
import { SecondBannersComponent } from './pages/main-page/second-banners/second-banners.component';
import { ComponentsModule } from './components/components.module';
import { MainBroadcastListModule } from './pages/main-page/main-broadcast-list/main-broadcast-list.module';
import { AccountStoreModule } from './account/account-store/account-store.module';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { ArmageddonModule } from './armageddon-view/armageddon.module';
import { AppNotFoundRoutingModule } from '@app/app-not-found-routing.module';


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
    MainBroadcastNavComponent,
    MainPageComponent,
    RbccPageComponent,
    PurchasesComponent,
    RatingComponent,
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
    SecondBannersComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    CoreModule,
    LayoutModule,
    HeaderModule,
    BroadcastModule,
    GamingModule,
    AppRoutingModule,
    PartnershipModule,
    WidgetModule,
    NewsModule,
    UserAccessModule,
    BrowserAnimationsModule,
    FormHelperModule,
    PaygateModule,
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
    RatingModule,
    PurchasesModule,
    EmbeddedWidgetModule,
    MatDialogModule,
    ComponentsModule,
    MainBroadcastListModule,
    AccountStoreModule,
    NgxsModule.forRoot([], { developmentMode: !environment.production }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      name: 'NGXS store',
      disabled: environment.production,
    }),
    ArmageddonModule,
    TvModule,
    AppNotFoundRoutingModule,
  ],
  providers: [
    NavObserver,
    AuthService,
    UserService,
    PaygateService,
    {provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig},
    MainPageResourceService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
