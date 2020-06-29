import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { MoveModule } from '../../../move/move.module';
import { ChessBoardComponent } from './chess-board.component';
import { ChessPlayerModule } from './chess-player/chess-player.module';
import { ChessScoreLineComponent } from './chess-score-line/chess-score-line.component';
import { SvgModule } from '@app/modules/svg/svg.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MoveModule,
    ChessPlayerModule,
    SvgModule
  ],
  declarations: [
    ChessBoardComponent,
    ChessScoreLineComponent
  ],
  exports: [
    ChessBoardComponent,
    ChessScoreLineComponent,
    ChessPlayerModule
  ]
})
export class ChessBoardModule { }
