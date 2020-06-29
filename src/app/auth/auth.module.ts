import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AuthResourceService } from './auth-resource.service';
import { AuthEffects } from './auth.effects';
import * as fromAuth from './auth.reducer';
import { IsAuthorizedGuard } from './is-authorized.guard';
import { IsNotAuthorizedGuard } from './is-not-authorized.guard';
import { AuthRouteInterceptor } from './auth-route-interceptor';
import { PurchasesModule } from '../purchases/purchases.module';
import { SocketConnectionService } from './socket-connection.service';
import { SocketService } from '@app/shared/socket/socket.service';

@NgModule({
  imports: [
    CommonModule,
    PurchasesModule,
    StoreModule.forFeature('auth', fromAuth.reducer),
    EffectsModule.forFeature([AuthEffects])
  ],
  providers: [
    AuthResourceService,
    IsAuthorizedGuard,
    IsNotAuthorizedGuard,
    AuthRouteInterceptor,
    SocketConnectionService,
    SocketService,
  ],
  declarations: []
})
export class AuthModule { }
