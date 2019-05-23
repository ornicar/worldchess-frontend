import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {ICamera} from './camera.model';
import {CameraActions, CameraActionTypes} from './camera.actions';
import {createFeatureSelector} from '@ngrx/store';

export interface State extends EntityState<ICamera> {
}

export const adapter: EntityAdapter<ICamera> = createEntityAdapter<ICamera>();

export const initialState: State = adapter.getInitialState({
});

export function reducer(
  state = initialState,
  action: CameraActions
): State {
  switch (action.type) {
    case CameraActionTypes.GetCamerasSuccess: {
      const cameras: ICamera[] = action.payload.cameras;
      return adapter.addAll(cameras, state);
    }

    case CameraActionTypes.ClearCameras: {
      return adapter.removeAll(state);
    }
  }

  return state;
}

export const selectCameraStore = createFeatureSelector<State>('camera');

export const {
  selectEntities,
  selectAll
} = adapter.getSelectors(selectCameraStore);
