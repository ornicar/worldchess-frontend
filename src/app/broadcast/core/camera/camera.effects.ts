import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Observable} from 'rxjs';
import {Action} from '@ngrx/store';
import {CameraActionTypes, GetCameras, GetCamerasSuccess} from './camera.actions';
import {map, switchMap} from 'rxjs/operators';
import {CameraResourceService} from './camera-resource.service';

@Injectable()
export class CameraEffects {

  constructor(
    private actions$: Actions,
    private cameraResource: CameraResourceService) {}

  @Effect()
  cameras$: Observable<Action> = this.actions$.pipe(
    ofType<GetCameras>(CameraActionTypes.GetCameras),
    switchMap((action: GetCameras) =>
      this.cameraResource.get(action.payload.tourId).pipe(
        map(cameras => new GetCamerasSuccess({ cameras }))
      )
    )
  );
}
