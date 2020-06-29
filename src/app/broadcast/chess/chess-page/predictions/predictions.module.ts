import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionComponent } from './prediction/prediction.component';
import { PredictionsComponent } from './predictions.component';
import { SharedModule } from '../../../../shared/shared.module';
import { AdjustOverflowHiddenDirective } from './prediction/adjust-overflow-hidden.directive';
import { FlowContentComponent } from './flow-content.component';
import { SvgModule } from '@app/modules/svg/svg.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SvgModule
  ],
  declarations: [
    PredictionComponent,
    PredictionsComponent,
    AdjustOverflowHiddenDirective,
    FlowContentComponent
  ],
  exports: [
    PredictionsComponent,
    PredictionComponent,
    FlowContentComponent,
  ]
})
export class PredictionsModule { }
