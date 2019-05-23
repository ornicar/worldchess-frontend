import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {NewsActions, NewsActionTypes} from './news.actions';
import {INews} from './news.model';

export interface State extends EntityState<INews> {
  selectedNewsId: number;
}

export const adapter: EntityAdapter<INews> = createEntityAdapter<INews>();

export const initialState: State = adapter.getInitialState({
  selectedNewsId: null
});

export function reducer(
  state = initialState,
  action: NewsActions
): State {
  switch (action.type) {
    case NewsActionTypes.LoadNewss: {
      return adapter.addAll(action.payload.newss, state);
    }
    default: {
      return state;
    }
  }
}

export const selectNewsState = createFeatureSelector<State>('news');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectNewsState);

export const selectSelectedNewsId = createSelector(selectNewsState, state => state.selectedNewsId);

export const selectSelectedNews = createSelector(
  selectEntities,
  selectSelectedNewsId,
  (newss, selectedNews) => newss[selectedNews]
);

export const selectNewssExcludeSelected = createSelector(
  selectEntities,
  selectIds,
  selectSelectedNewsId,
  (newss, ids: number[], selectedNews) =>
    ids
      .filter(id => id !== selectedNews)
      .map(id => newss[id])
);
