import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    ScreenSliderComponent
  ],
  exports: [
    ScreenSliderComponent
  ]
})
export class ScreenModule {
  constructor (@Optional() @SkipSelf() parentModule: ScreenModule) {
    if (parentModule) {
      throw new Error(
        'ScreenModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ScreenModule,
      providers: [
        ScreenStateService,
      ],
    };
  }
}
