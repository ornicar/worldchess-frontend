import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamePageComponent } from './game-page/game-page.component';
import { GameRoutingModule } from './game-routing.module';
import { ChessBoardModule } from './chess-board/chess-board.module';
import { GameFieldComponent } from './game-field/game-field.component';
import { NgxsModule } from '@ngxs/store';
import { GameState } from './state/game.state';
import { GameResourceService } from './state/game.resouce.service';
import { PlayerPanelComponent } from './player-panel/player-panel.component';
import { MoveTimerComponent } from './chess-board/move-timer/move-timer.component';
import { PipesModule } from '../shared/pipes/pipes.module';
import { SearchOpponentComponent } from './search-opponent/search-opponent.component';
import { MovesHistoryComponent } from './moves-history/moves-history.component';
import { HistoryMoveComponent } from './moves-history/history-move/history-move.component';
import { HistoryMoveFigureComponent } from './moves-history/history-move-figure/history-move-figure.component';
import { GameNotificationComponent } from './game-notification/game-notification.component';
import { LeaveGameGuard } from './guards/leave-game.guard';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    GameRoutingModule,
    ChessBoardModule,
    NgxsModule.forFeature([GameState]),
    PipesModule,
    SharedModule,
  ],
  providers: [
    GameResourceService,
    LeaveGameGuard,
  ],
  declarations: [
    PlayerPanelComponent,
    GameNotificationComponent,
    MovesHistoryComponent,
    MoveTimerComponent,
    SearchOpponentComponent,
    GamePageComponent,
    GameFieldComponent,
    HistoryMoveComponent,
    HistoryMoveFigureComponent,
  ],
})
export class GameModule { }
