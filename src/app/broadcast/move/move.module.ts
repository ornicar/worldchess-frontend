import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {SharedModule} from '../../shared/shared.module';
import {MoveIconComponent} from './components/move-icon/move-icon.component';
import {MovePlaceholderComponent} from './components/move-placeholder/move-placeholder.component';
import {MoveComponent} from './components/move/move.component';
import {MoveResourceService} from './move-resource.service';
import {MoveEffects} from './move.effects';
import * as fromMove from './move.reducer';

const COMPONENTS = [
  MoveIconComponent,
  MoveComponent,
  MovePlaceholderComponent
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature('move', fromMove.reducer),
    EffectsModule.forFeature([MoveEffects]),
  ],
  declarations: [
    ...COMPONENTS
  ],
  providers: [
    MoveResourceService
  ],
  exports: [
    ...COMPONENTS
  ]
})
export class MoveModule { }
