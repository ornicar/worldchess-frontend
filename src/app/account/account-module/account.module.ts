import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ImageCropperModule } from 'ngx-image-cropper';

import { FormHelperModule } from '@app/form-helper/form-helper.module';
import { LayoutModule } from '@app/layout/layout.module';
import { SharedModule } from '@app/shared/shared.module';
import { AccountRatingResolveGuard } from './account-rating-resolve.guard';
import { AccountResolveGuard } from './account-resolve.guard';
import { AccountComponent } from './account.component';
import { MembershipComponent } from './membership/membership.component';
import { ProfileComponent } from './profile/profile.component';
import { MyEventsComponent } from './my-events/my-events.component';
import { CanUserCreateEventGuard } from './can-user-create-event.guard';
import { ManageTournamentComponent } from './manage-tournament/manage-tournament.component';
import { MyTournamentsListComponent } from './my-tournaments-list/my-tournaments-list.component';
import { ManageTournamentMainComponent } from './manage-tournament-main/manage-tournament-main.component';
import { ManageTournamentAddedComponent } from './manage-tournament-added/manage-tournament-added.component';
import { ManageTournamentRoundsComponent } from './manage-tournament-rounds/manage-tournament-rounds.component';
import { ManageTournamentPartnersComponent } from './manage-tournament-partners/manage-tournament-partners.component';
import {
  TournamentPartnerControlComponent
} from './manage-tournament-partners/tournament-partner-control/tournament-partner-control.component';
import { MyTournamentRoundItemComponent } from './manage-tournament-rounds/my-tournament-round-item/my-tournament-round-item.component';
import { ManageTournamentPlayersComponent } from './manage-tournament-players/manage-tournament-players.component';
import { ManageTournamentPaymentsComponent } from './manage-tournament-payments/manage-tournament-payments.component';
import { ManageTournamentWidgetsComponent } from './manage-tournament-widgets/manage-tournament-widgets.component';
import { ManageTournamentCamerasComponent } from './manage-tournament-cameras/manage-tournament-cameras.component';
import {
  TournamentWidgetControlComponent
} from './manage-tournament-widgets/tournament-widget-control/tournament-widget-control.component';
import { ProfileFideIdComponent } from './profile-fide-id/profile-fide-id.component';
import { ComponentsModule } from '@app/components/components.module';
import { ProfileAvatarCropModalComponent } from './profile-avatar-crop-modal/profile-avatar-crop-modal.component';

import { MainBroadcastListModule } from '@app/pages/main-page/main-broadcast-list/main-broadcast-list.module';
import { AccountRoutingModule } from './account-routing.module';
import { AccountAuthInterceptorService } from './services/account-auth-interceptor.service';
import { ModalWindowsModule } from '@app/modal-windows/modal-windows.module';
import { SvgModule } from '@app/modules/svg/svg.module';
import { PaygateModule } from '@app/modules/paygate/paygate.module';
import { RatingModule } from '@app/modules/rating/rating.module';
import { MatIconModule, MatListModule } from '@angular/material';
import { AccountService } from '@app/account/account-store/account.service';



@NgModule({
  imports: [
    CommonModule,
    AccountRoutingModule,
    FormHelperModule,
    LayoutModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ComponentsModule,
    ImageCropperModule,
    MainBroadcastListModule,
    ModalWindowsModule,
    SvgModule,
    PaygateModule,
    RatingModule,
    MatListModule,
    MatIconModule,
  ],
  providers: [
    AccountResolveGuard,
    AccountRatingResolveGuard,
    CanUserCreateEventGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AccountAuthInterceptorService,
      multi: true
    },
    AccountService
  ],
  declarations: [
    MembershipComponent,
    ProfileComponent,
    AccountComponent,
    MyEventsComponent,
    ManageTournamentComponent,
    MyTournamentsListComponent,
    ManageTournamentMainComponent,
    ManageTournamentAddedComponent,
    ManageTournamentRoundsComponent,
    ManageTournamentPartnersComponent,
    ManageTournamentPlayersComponent,
    ManageTournamentCamerasComponent,
    TournamentPartnerControlComponent,
    MyTournamentRoundItemComponent,
    ManageTournamentPaymentsComponent,
    ManageTournamentWidgetsComponent,
    TournamentWidgetControlComponent,
    ProfileFideIdComponent,
    ProfileAvatarCropModalComponent
  ],
  exports: [
    MembershipComponent,
    ProfileComponent,
    AccountComponent,
  ],
  entryComponents: [
    ProfileAvatarCropModalComponent
  ]
})
export class AccountModule {
}
