import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {TourActions, TourActionTypes} from './tour.actions';
import {ITour} from './tour.model';

export interface State extends EntityState<ITour> {
  selectedTourId: number;
}

export function sortByTourNumber(a: ITour, b: ITour): number {
  if (a.tour_number === b.tour_number) {
    return 0;
  } else if (a.tour_number < b.tour_number) {
    return -1;
  } else {
    return 1;
  }
}

export const adapter: EntityAdapter<ITour> = createEntityAdapter<ITour>({
  sortComparer: sortByTourNumber
});

export const initialState: State = adapter.getInitialState({
  selectedTourId: null
});

export function reducer(
  state = initialState,
  action: TourActions
): State {
  switch (action.type) {
    case TourActionTypes.AddTour: {
      return adapter.addOne(action.payload.tour, state);
    }

    /*case TourActionTypes.UpsertTour: {
      return adapter.upsertOne(action.payload.tour, state);
    }*/

    case TourActionTypes.AddTours: {
      return adapter.addMany(action.payload.tours, state);
    }

    /*case TourActionTypes.UpsertTours: {
      return adapter.upsertMany(action.payload.tours, state);
    }*/

    case TourActionTypes.UpdateTour: {
      return adapter.updateOne(action.payload.tour, state);
    }

    case TourActionTypes.UpdateTours: {
      return adapter.updateMany(action.payload.tours, state);
    }

    case TourActionTypes.DeleteTour: {
      return adapter.removeOne(action.payload.id, state);
    }

    case TourActionTypes.DeleteTours: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case TourActionTypes.LoadTours: {
      return adapter.addAll(action.payload.tours, state);
    }

    case TourActionTypes.ClearTours: {
      return adapter.removeAll(state);
    }

    case TourActionTypes.SetSelectedTour: {
      return {
        ...state,
        selectedTourId: action.payload.id
      };
    }

    case TourActionTypes.ClearSelectedTour: {
      return {
        ...state,
        selectedTourId: null
      };
    }

    default: {
      return state;
    }
  }
}

export const selectTourStore = createFeatureSelector<State>('tour');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectTourStore);

export const selectSelectedTourId = createSelector(selectTourStore, store => store.selectedTourId);

export const selectTour = () => createSelector(selectEntities, (entities, { tourId }) => entities[tourId]);
