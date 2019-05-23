import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ChessPageModule} from '../../app/broadcast/chess/chess-page/chess-page.module';
import {AppComponent} from './app.component';
import {WidgetChessBoardControllerModule} from './components/widget-chess-board-controller/widget-chess-board-controller.module';
import { WidgetPageComponent } from './pages/widget-page/widget-page.component';
import {WidgetLifeCycleService} from './services/widget-life-cycle.service';
import { WidgetService } from './services/widget.service';
import { WidgetHeaderComponent } from './components/widget-header/widget-header.component';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { WidgetEffects } from './services/widget.effects';
import { MoveModule } from '../../app/broadcast/move/move.module';
import { SharedModule } from '../../app/shared/shared.module';
import 'moment-duration-format';
import { ChessPageSelectorsService } from '../../app/broadcast/chess/chess-page/chess-page-selectors.service';
import { WidgetFooterComponent } from './components/widget-footer/widget-footer.component';
import { StoreModule } from '@ngrx/store';
import * as fromWidget from './services/widget.reducer';
import { WidgetBoardComponent } from './components/widget-board/widget-board.component';
import { WidgetLoadService } from './services/widget-load.service';

@NgModule({
  declarations: [
    AppComponent,
    WidgetPageComponent,
    WidgetHeaderComponent,
    WidgetFooterComponent,
    WidgetBoardComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule,
    HttpClientModule,
    SharedModule,
    MoveModule,
    StoreModule.forFeature('widget', fromWidget.reducer),
    EffectsModule.forFeature([
      WidgetEffects
    ]),
    ChessPageModule,
    WidgetChessBoardControllerModule
  ],
  providers: [
    WidgetService,
    WidgetLoadService,
    ChessPageSelectorsService,
    WidgetLifeCycleService
  ],
  exports: [
    ChessPageModule,
    WidgetPageComponent,
    WidgetBoardComponent
  ]
})
export class WidgetModule {
}
