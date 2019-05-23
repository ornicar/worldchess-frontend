import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../../../shared/shared.module';
import {MoveModule} from '../../../move/move.module';
import {VariationMoveModule} from '../../../variation-move/variation-move.module';
import {AutoScrollDirective} from './auto-scroll.directive';
import {HistoryMovesComponent} from './history-moves.component';
import { HistoryMovesPlaceholderComponent } from './history-moves-placeholder/history-moves-placeholder.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MoveModule,
    VariationMoveModule
  ],
  declarations: [
    AutoScrollDirective,
    HistoryMovesComponent,
    HistoryMovesPlaceholderComponent
  ],
  exports: [
    HistoryMovesComponent,
    HistoryMovesPlaceholderComponent
  ]
})
export class HistoryMovesModule { }
