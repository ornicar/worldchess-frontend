import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PredictionComponent} from './prediction/prediction.component';
import {PredictionsComponent} from './predictions.component';
import {SharedModule} from '../../../../shared/shared.module';
import {AdjustOverflowHiddenDirective} from './prediction/adjust-overflow-hidden.directive';
import {FlowContentComponent} from './flow-content.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    PredictionComponent,
    PredictionsComponent,
    AdjustOverflowHiddenDirective,
    FlowContentComponent
  ],
  exports: [
    PredictionsComponent
  ]
})
export class PredictionsModule { }
