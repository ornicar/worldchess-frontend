import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {EventActions, EventActionTypes} from './event.actions';
import {IEvent} from './event.model';
import * as moment from 'moment';

export interface State extends EntityState<IEvent> {
  selectedEventId: number;
}

export function sortByDate(a: IEvent, b: IEvent): number {
  const aDate = moment(a.event_date, 'YYYY-MM-DD');
  const bDate = moment(b.event_date, 'YYYY-MM-DD');

  if (aDate === bDate) {
    return 0;
  } else if (aDate > bDate) {
    return -1;
  } else {
    return 1;
  }
}

export const adapter: EntityAdapter<IEvent> = createEntityAdapter<IEvent>({
  sortComparer: sortByDate
});

export const initialState: State = adapter.getInitialState({
  selectedEventId: null
});

export function reducer(
  state = initialState,
  action: EventActions
): State {
  switch (action.type) {
    case EventActionTypes.AddEvent: {
      return adapter.addOne(action.payload.event, state);
    }

    /*case EventActionTypes.UpsertEvent: {
      return adapter.upsertOne(action.payload.event, state);
    }*/

    case EventActionTypes.AddEvents: {
      return adapter.addMany(action.payload.events, state);
    }

    /*case EventActionTypes.UpsertEvents: {
      return adapter.upsertMany(action.payload.events, state);
    }*/

    case EventActionTypes.UpdateEvent: {
      return adapter.updateOne(action.payload.event, state);
    }

    case EventActionTypes.UpdateEvents: {
      return adapter.updateMany(action.payload.events, state);
    }

    case EventActionTypes.DeleteEvent: {
      return adapter.removeOne(action.payload.id, state);
    }

    case EventActionTypes.DeleteEvents: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case EventActionTypes.LoadEvents: {
      return adapter.addAll(action.payload.events, state);
    }

    case EventActionTypes.ClearEvents: {
      return adapter.removeAll(state);
    }

    case EventActionTypes.SetSelectedEvent: {
      return {
        ...state,
        selectedEventId: action.payload.id
      };
    }

    case EventActionTypes.ClearSelectedEvent: {
      return {
        ...state,
        selectedEventId: null
      };
    }

    default: {
      return state;
    }
  }
}

export const selectEventsState = createFeatureSelector<State>('event');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectEventsState);

export const selectSelectedEventId = createSelector(selectEventsState, state => state.selectedEventId);

export const selectEvent = () => createSelector(selectEntities, (entities, { eventId }) => entities[eventId]);

export const selectSelectedEvent = createSelector(
  selectEntities,
  selectSelectedEventId,
  (events, selectedEventId) => events[selectedEventId]
);
