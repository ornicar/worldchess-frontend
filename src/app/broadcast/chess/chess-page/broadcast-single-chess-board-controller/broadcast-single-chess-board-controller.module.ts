import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ChessBoardModule} from '../chess-board/chess-board.module';
import {BroadcastSingleChessBoardControllerComponent} from './broadcast-single-chess-board-controller.component';

@NgModule({
  declarations: [
    BroadcastSingleChessBoardControllerComponent
  ],
  imports: [
    CommonModule,
    ChessBoardModule
  ],
  exports: [
    BroadcastSingleChessBoardControllerComponent,
    ChessBoardModule
  ]
})
export class BroadcastSingleChessBoardControllerModule { }
