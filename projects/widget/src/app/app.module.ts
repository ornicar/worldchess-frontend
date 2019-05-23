import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@app/broadcast/core/core.module';
import { BoardResolveGuard } from '@app/broadcast/guards/board-resolve.guard';
import { FideTournamentResolveGuard } from '@app/broadcast/guards/fide-tournament-resolve-guard.service';
import { metaReducers, reducers } from '@app/reducers';
import { SharedModule } from '@app/shared/shared.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleTagManager } from 'angulartics2/gtm';
import 'moment-duration-format';
import { CookieModule } from 'ngx-cookie';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { EmbeddedWidgetModule } from '@src/app/embedded-widget/embedded-widget.module';

// Modules and their components should be refactored  and moved to CommonComponentsModule.

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot([]),
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    Angulartics2Module.forRoot([Angulartics2GoogleTagManager]),
    SharedModule,
    CookieModule.forRoot(),
    CoreModule.forRoot(),
    EmbeddedWidgetModule
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
    FideTournamentResolveGuard,
    BoardResolveGuard,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
