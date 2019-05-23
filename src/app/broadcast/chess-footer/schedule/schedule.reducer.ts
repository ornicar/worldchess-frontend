import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {ScheduleActions, ScheduleActionTypes} from './schedule.actions';
import {ISchedule} from './schedule.model';

export interface State extends EntityState<ISchedule> {
}

export const adapter: EntityAdapter<ISchedule> = createEntityAdapter<ISchedule>();

export const initialState: State = adapter.getInitialState({
});

export function reducer(
  state = initialState,
  action: ScheduleActions
): State {
  switch (action.type) {
    case ScheduleActionTypes.LoadSchedules: {
      return adapter.addAll(action.payload.schedules, state);
    }
    default: {
      return state;
    }
  }
}

export const selectScheduleState = createFeatureSelector<State>('schedule');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectScheduleState);
