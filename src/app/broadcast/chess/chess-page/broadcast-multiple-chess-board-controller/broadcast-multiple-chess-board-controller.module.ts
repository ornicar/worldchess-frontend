import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ChessBoardModule} from '../chess-board/chess-board.module';
import {BroadcastMultipleChessBoardControllerComponent} from './broadcast-multiple-chess-board-controller.component';

@NgModule({
  declarations: [
    BroadcastMultipleChessBoardControllerComponent
  ],
  imports: [
    CommonModule,
    ChessBoardModule
  ],
  exports: [
    BroadcastMultipleChessBoardControllerComponent,
    ChessBoardModule
  ]
})
export class BroadcastMultipleChessBoardControllerModule { }
