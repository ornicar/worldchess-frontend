import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ChessBoardModule} from '../../../../app/broadcast/chess/chess-page/chess-board/chess-board.module';
import {WidgetChessBoardControllerComponent} from './widget-chess-board-controller.component';

@NgModule({
  declarations: [
    WidgetChessBoardControllerComponent
  ],
  imports: [
    CommonModule,
    ChessBoardModule
  ],
  exports: [
    WidgetChessBoardControllerComponent,
    ChessBoardModule
  ]
})
export class WidgetChessBoardControllerModule { }
