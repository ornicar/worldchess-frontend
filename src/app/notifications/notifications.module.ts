import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {AuthModule} from '../auth/auth.module';
import * as fromNotifications from './notifications.reducer';
import {NotificationsResourceService} from './notifications-resource.service';
import { NotificationsComponent } from './notifications.component';
import { WidgetsModule } from '../shared/widgets/widgets.module';
import {NotificationsEffects} from './notifications.effects';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    WidgetsModule,
    RouterModule,
    AuthModule,
    StoreModule.forFeature('notifications', fromNotifications.reducer),
    EffectsModule.forFeature([NotificationsEffects]),
  ],
  providers: [
    NotificationsResourceService,
  ],
  declarations: [
    NotificationsComponent,
  ],
  exports: [
    NotificationsComponent,
  ]
})
export class NotificationsModule { }
