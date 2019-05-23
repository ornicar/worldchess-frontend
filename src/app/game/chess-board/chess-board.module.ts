import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChessBoardComponent } from './chess-board.component';
import { RouterModule } from '@angular/router';
import { WidgetsModule } from '@app/shared/widgets/widgets.module';

@NgModule({
  imports: [
    CommonModule,
    WidgetsModule,
    RouterModule,
  ],
  declarations: [
    ChessBoardComponent,
  ],
  exports: [
    ChessBoardComponent,
  ]
})
export class ChessBoardModule { }
