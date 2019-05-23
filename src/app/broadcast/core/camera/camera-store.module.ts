import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {StoreModule} from '@ngrx/store';
import * as fromCamera from './camera.reducer';
import {EffectsModule} from '@ngrx/effects';
import {CameraEffects} from './camera.effects';
import {CameraResourceService} from './camera-resource.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    StoreModule.forFeature('camera', fromCamera.reducer),
    EffectsModule.forFeature([
      CameraEffects
    ])
  ],
  providers: [
    CameraResourceService
  ]
})
export class CameraStoreModule { }
