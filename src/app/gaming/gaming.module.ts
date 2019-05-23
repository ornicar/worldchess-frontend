import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EffectsModule} from '@ngrx/effects';
import {BroadcastModule} from '../broadcast/broadcast.module';
import {
  BroadcastSingleChessBoardControllerModule
} from '../broadcast/chess/chess-page/broadcast-single-chess-board-controller/broadcast-single-chess-board-controller.module';
import {ChessPageModule} from '../broadcast/chess/chess-page/chess-page.module';
import {LayoutModule} from '../layout/layout.module';
import {SharedModule} from '../shared/shared.module';
import {GamePageComponent} from './components/game-page/game-page.component';
import {
  GamingGameChessBoardControllerComponent
} from './components/gaming-game-chess-board-controller/gaming-game-chess-board-controller.component';
import {GamePlayPageContainerComponent} from './containers/game-play-page-container.component';
import {GamingResourceService} from './gaming-resource.service';
import {GamingRoutingModule} from './gaming-routing.module';
import { ComponentsModule } from '../components/components.module';
import { TournamentsOnlineComponent } from './containers/tournaments-online/tournaments-online.component';
import { TournamentOnlineListComponent } from './components/tournament-online-list/tournament-online-list.component';
import { ModalWindowsModule } from '../modal-windows/modal-windows.module';
import {GamingEffects} from './gaming.effects';

@NgModule({
  declarations: [
    GamePageComponent,
    GamePlayPageContainerComponent,
    TournamentsOnlineComponent,
    TournamentOnlineListComponent,
    GamingGameChessBoardControllerComponent,
  ],
  providers: [
    GamingResourceService
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    GamingRoutingModule,
    EffectsModule.forFeature([GamingEffects]),
    SharedModule,
    LayoutModule,
    BroadcastSingleChessBoardControllerModule,
    ChessPageModule,
    BroadcastModule,
    ModalWindowsModule,
  ]
})
export class GamingModule { }
