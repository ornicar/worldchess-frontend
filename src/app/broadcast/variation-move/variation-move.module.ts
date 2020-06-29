import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../../shared/shared.module';
import { MoveModule } from '../move/move.module';
import { VariationMovesComponent } from './components/variation-moves/variation-moves.component';
import { VariationMoveResourceService } from './variation-move-resource.service';
import { VariationMoveEffects } from './variation-move.effects';
import * as fromVariationMove from './variation-move.reducer';

const COMPONENTS = [
  VariationMovesComponent
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MoveModule,
    StoreModule.forFeature('variationMove', fromVariationMove.reducer),
    EffectsModule.forFeature([VariationMoveEffects]),
  ],
  declarations: [
    ...COMPONENTS
  ],
  providers: [
    VariationMoveResourceService
  ],
  exports: [
    ...COMPONENTS
  ]
})
export class VariationMoveModule { }
