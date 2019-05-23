import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ScreenFixedDirective} from './screen-fixed.directive';
import {ScreenStateService} from './screen-state.service';
import { ScreenSliderComponent } from './screen-slider.component';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    ScreenStateService
  ],
  declarations: [
    ScreenFixedDirective,
    ScreenSliderComponent
  ],
  exports: [
    ScreenFixedDirective,
    ScreenSliderComponent
  ]
})
export class ScreenModule { }
