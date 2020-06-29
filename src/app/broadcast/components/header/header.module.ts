import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BroadcastNavProtectComponent } from './broadcast-nav-protect/broadcast-nav-protect.component';
import { HeaderSmallComponent } from './header-small.component';
import { HeaderComponent } from './header.component';
import { HeaderSelectComponent } from './header-select/header-select.component';
import { CommonModule } from '@angular/common';
import { MatchOptionComponent } from './match-option/match-option.component';
import { PlayerOptionComponent } from './player-option/player-option.component';
import { SharedModule } from '@app/shared/shared.module';
import { HeaderLogoComponent } from './header-logo/header-logo.component';
import { EventResourceService } from '@app/broadcast/core/event/event-resource.service';
import { TeamResourceService } from '@app/broadcast/core/team/team-resource.service';
import { PlayerResourceService } from '@app/broadcast/core/player/player-resource.service';
import { TournamentResourceService } from '@app/broadcast/core/tournament/tournament-resource.service';
import { TourResourceService } from '@app/broadcast/core/tour/tour-resource.service';
import { MatchResourceService } from '@app/broadcast/core/match/match-resource.service';
import { BoardResourceService } from '@app/broadcast/core/board/board-resource.service';
import { HeaderItemComponent } from './header-item/header-item.component';
import { SvgModule } from '@app/modules/svg/svg.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    SvgModule
  ],
  providers: [
    EventResourceService,
    TeamResourceService,
    PlayerResourceService,
    TournamentResourceService,
    TourResourceService,
    MatchResourceService,
    BoardResourceService,
  ],
  declarations: [
    HeaderComponent,
    HeaderSmallComponent,
    HeaderSelectComponent,
    MatchOptionComponent,
    PlayerOptionComponent,
    HeaderLogoComponent,
    BroadcastNavProtectComponent,
    HeaderItemComponent,
  ],
  exports: [
    HeaderComponent,
    HeaderSmallComponent,
    HeaderSelectComponent,
    MatchOptionComponent,
    PlayerOptionComponent,
    HeaderLogoComponent,
    BroadcastNavProtectComponent
  ]
})
export class HeaderModule { }
