import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import { GetEmbeddedWidgetComponent } from '@app/broadcast/chess/chess-page/get-embedded-widget/get-embedded-widget.component';
import {StoreModule} from '@ngrx/store';
import {BoardModule} from '../../../board/board.module';
import {PaygateModule} from '../../../paygate/paygate.module';
import {
  BroadcastMultipleChessBoardControllerModule
} from './broadcast-multiple-chess-board-controller/broadcast-multiple-chess-board-controller.module';
import {
  BroadcastSingleChessBoardControllerModule
} from './broadcast-single-chess-board-controller/broadcast-single-chess-board-controller.module';
import {ChatInfoModalComponent} from './chat-info-modal/chat-info-modal.component';
import {ChessPagesComponent} from './chess-pages.component';
import * as fromGame from './game/game.reducer';
import {ChessPageComponent} from './chess-page.component';
import {CommonModule} from '@angular/common';
import {ChatModule} from '../chat/chat.module';
import {SharedModule} from '../../../shared/shared.module';
import {PredictionsModule} from './predictions/predictions.module';
import {ChessBoardAreaModule} from './chess-board-area/chess-board-area.module';
import {ChessBoardModule} from './chess-board/chess-board.module';
import {HistoryMovesModule} from './history-moves/history-moves.module';
import {ChessPageSelectorsService} from './chess-page-selectors.service';
import {LivestreamContainerComponent} from './livestream-container/livestream-container.component';
import {MatchTimeInfoComponent} from './match-time-info/match-time-info.component';
import {LivestreamBoardSwapButtonComponent} from './livestream-board-swap-button/livestream-board-swap-button.component';
import {LiveStreamCameraListComponent} from './livestream-camera-list/livestream-camera-list.component';

import { GoPremiumModalComponent } from './go-premium-modal/go-premium-modal.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { PurchasesModule } from '../../../purchases/purchases.module';
import { ChessPageLayoutComponent } from './components/chess-page-layout/chess-page-layout.component';
import {
  ChessSingleGameContainerComponent
} from './chess-single-game-container/chess-single-game-container.component';
import { BaseMetricsComponent } from './base-metrics/base-metrics.component';
import {TourMetricsComponent} from './tour-metrics/tour-metrics.component';
import { GamePlayersComponent } from './game-players/game-players.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    CommonModule,
    ChatModule,
    FormsModule,
    RouterModule,
    SharedModule,
    BoardModule,
    PredictionsModule,
    ChessBoardAreaModule,
    ChessBoardModule,
    BroadcastSingleChessBoardControllerModule,
    BroadcastMultipleChessBoardControllerModule,
    HistoryMovesModule,
    PaygateModule,
    PurchasesModule,
    StoreModule.forFeature('game', fromGame.reducer),
    NgxSmartModalModule.forRoot(),
    BrowserAnimationsModule,
  ],
  declarations: [
    ChessPageComponent,
    ChessPagesComponent,
    MatchTimeInfoComponent,
    TourMetricsComponent,
    LivestreamContainerComponent,
    LivestreamBoardSwapButtonComponent,
    LiveStreamCameraListComponent,
    GetEmbeddedWidgetComponent,
    GoPremiumModalComponent,
    ChatInfoModalComponent,
    ChessPageLayoutComponent,
    ChessSingleGameContainerComponent,
    BaseMetricsComponent,
    GamePlayersComponent
  ],
  providers: [
    ChessPageSelectorsService
  ],
  exports: [
    ChessBoardAreaModule,
    HistoryMovesModule,
    ChatInfoModalComponent,
    MatchTimeInfoComponent,
    ChessPageComponent,
    ChessPagesComponent,
    LivestreamContainerComponent,
    LivestreamBoardSwapButtonComponent,
    LiveStreamCameraListComponent,
    ChessSingleGameContainerComponent,
    ChessPageLayoutComponent,
    GetEmbeddedWidgetComponent,
    GoPremiumModalComponent,
    BroadcastSingleChessBoardControllerModule
  ]
})
export class ChessPageModule { }
