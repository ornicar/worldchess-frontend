import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectivesModule } from './directives/directives.module';
import { PipesModule } from './pipes/pipes.module';
import { ScreenModule } from './screen/screen.module';
import { WidgetsModule } from './widgets/widgets.module';
import { YoutubePlayerService } from './widgets/youtube-player/youtube-player.service';
import { PaygateFixedHandlerComponent } from './components/paygate-fixed-handler/paygate-fixed-handler.component';
import { PaygateModule } from '../modules/paygate/paygate.module';
import { PaygatePopupManagerService } from './services/paygate-popup-manager.service';


@NgModule({
  imports: [
    PipesModule,
    WidgetsModule,
    DirectivesModule,
    ScreenModule,
    CommonModule,
    PaygateModule,
  ],
  declarations: [
    PaygateFixedHandlerComponent,
  ],
  exports: [
    PipesModule,
    WidgetsModule,
    DirectivesModule,
    ScreenModule,
    PaygateFixedHandlerComponent,
  ],
  providers: [
    YoutubePlayerService,
    PaygatePopupManagerService,
  ],
})
export class SharedModule { }
