import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectivesModule } from './directives/directives.module';
import { PipesModule } from './pipes/pipes.module';
import { WidgetsModule } from './widgets/widgets.module';
import { YoutubePlayerService } from './widgets/youtube-player/youtube-player.service';
import { PaygateFixedHandlerComponent } from './components/paygate-fixed-handler/paygate-fixed-handler.component';
import { PaygatePopupManagerService } from './services/paygate-popup-manager.service';
import { ScoreComponent } from './components/score/score.component';
import { TournamentStateComponent } from '@app/broadcast/core/tournament/tournament-state/tournament-state.component';
import { BtnWithLoadingComponent } from '@app/controls/btn-with-loading/btn-with-loading.component';
import { SvgModule } from '@app/modules/svg/svg.module';
import { ChessgroundAudioService } from '@app/shared/widgets/chessground/chessground.audio.service';


@NgModule({
  imports: [
    PipesModule,
    WidgetsModule,
    DirectivesModule,
    CommonModule,
    SvgModule
  ],
  declarations: [
    PaygateFixedHandlerComponent,
    ScoreComponent,
    TournamentStateComponent,
    BtnWithLoadingComponent,
  ],
  exports: [
    PipesModule,
    WidgetsModule,
    DirectivesModule,
    PaygateFixedHandlerComponent,
    ScoreComponent,
    TournamentStateComponent,
    BtnWithLoadingComponent
  ],
  providers: [
    YoutubePlayerService,
    PaygatePopupManagerService,
    ChessgroundAudioService
  ],
})
export class SharedModule { }
