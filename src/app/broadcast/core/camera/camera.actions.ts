import {Action} from '@ngrx/store';
import {ICamera} from './camera.model';

export enum CameraActionTypes {
  GetCameras = '[Camera] Get cameras',
  GetCamerasSuccess = '[Camera] Get cameras success',
  ClearCameras = '[Camera] Clear cameras'
}

export class GetCameras implements Action {
  readonly type = CameraActionTypes.GetCameras;

  constructor(public payload: { tourId: number }) {}
}

export class ClearCameras implements Action {
  readonly type = CameraActionTypes.ClearCameras;

  constructor() {}
}

export class GetCamerasSuccess implements Action {
  readonly type = CameraActionTypes.GetCamerasSuccess;

  constructor(public payload: { cameras: ICamera[] }) {}
}

export type CameraActions =
  GetCameras |
  ClearCameras |
  GetCamerasSuccess;
