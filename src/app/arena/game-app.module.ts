import { HammerGestureConfig, HAMMER_GESTURE_CONFIG, BrowserModule } from '@angular/platform-browser';
import { Injectable, NgModule, NgModuleFactoryLoader, SystemJsNgModuleLoader } from '@angular/core';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../../environments/environment';
import { AccountStoreModule } from '../account/account-store/account-store.module';
import { NgxsModule, NoopNgxsExecutionStrategy } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { SvgModule } from '@app/modules/svg/svg.module';
import { GameAppRoutingModule } from './game-app.routing.module';
import { LayoutModule } from '@app/layout/layout.module';
import { CommonModule } from '@angular/common';
import { ScreenModule } from '@app/shared/screen/screen.module';
import { ComponentsModule } from '@app/components/components.module';
import { StoreModule } from '@ngrx/store';
import { metaReducers, reducers } from '@app/reducers';
import { EffectsModule } from '@ngrx/effects';
import { AuthModule } from '@app/auth/auth.module';
import { CookieModule } from 'ngx-cookie';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import 'moment-duration-format';
import { CoreModule } from '@app/broadcast/core/core.module';
import { GameAppComponent } from '@app/arena/app/game-app.component';
import { IsMainApp } from '@app/is-main-app.token';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReloadInterceptor } from '@app/arena/reload.interceptor';
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
    GameAppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CommonModule,
    CoreModule.forRoot(),
    GameAppRoutingModule,
    AuthModule,
    ScreenModule.forRoot(),
    LayoutModule,
    CookieModule.forRoot(),
    StoreModule.forRoot(reducers, {metaReducers}),
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    ComponentsModule,
    AccountStoreModule,
    NgxsModule.forRoot([], {
      developmentMode: !environment.production,
      executionStrategy: NoopNgxsExecutionStrategy,
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      name: 'NGXS store',
      disabled: environment.production,
    }),
    SvgModule,
    AppNotFoundRoutingModule
  ],
  providers: [
    {provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig},
    { provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader },
    {
      provide: IsMainApp,
      useValue: false,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ReloadInterceptor,
      multi: true,
    },
  ],
  bootstrap: [GameAppComponent],
})
export class GameAppModule {
}
