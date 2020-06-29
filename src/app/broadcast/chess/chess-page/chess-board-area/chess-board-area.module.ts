import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { BoardModule } from '../../../../board/board.module';
import {
  BroadcastMultipleChessBoardControllerModule
} from '../broadcast-multiple-chess-board-controller/broadcast-multiple-chess-board-controller.module';
import {
  BroadcastSingleChessBoardControllerModule
} from '../broadcast-single-chess-board-controller/broadcast-single-chess-board-controller.module';
import { FavoriteBoardsModule } from '../../../favorite-boards/favorite-boards.module';
import { ChessPlayerModule } from '../chess-board/chess-player/chess-player.module';
import { ChessBoardAreaComponent } from './chess-board-area.component';
import { SharedModule } from '../../../../shared/shared.module';
import { ChessNavigationModule } from './chess-navigation/chess-navigation.module';
import { RouterModule } from '@angular/router';
import { ChessBoardTitleComponent } from './chess-board-title/chess-board-title.component';
import { ChessBoardsAreaComponent } from './chess-boards-area/chess-boards-area.component';
import { ChessBoardGridItemComponent } from './chess-boards-area/chess-board-grid-item/chess-board-grid-item.component';
import { MultiboardLinkComponent } from './multiboard-link/multiboard-link.component';
import { SvgModule } from '@app/modules/svg/svg.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule,
    VirtualScrollerModule,
    BoardModule,
    BroadcastSingleChessBoardControllerModule,
    BroadcastMultipleChessBoardControllerModule,
    ChessNavigationModule,
    ChessPlayerModule,
    FavoriteBoardsModule,
    SvgModule
  ],
  declarations: [
    ChessBoardAreaComponent,
    ChessBoardTitleComponent,
    ChessBoardsAreaComponent,
    ChessBoardGridItemComponent,
    MultiboardLinkComponent
  ],
  exports: [
    ChessBoardsAreaComponent,
    ChessBoardAreaComponent,
    ChessBoardTitleComponent,
    ChessPlayerModule,
  ]
})
export class ChessBoardAreaModule { }
