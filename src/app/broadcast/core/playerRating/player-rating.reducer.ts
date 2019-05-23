import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {PlayerRatingActions, PlayerRatingActionTypes} from './player-rating.actions';
import {IPlayerRating} from './player-rating.model';

export interface State extends EntityState<IPlayerRating> {
  selectedPlayerId: number;
}

export function sortByRankNumber(a: IPlayerRating, b: IPlayerRating): number {
  if (a.rank === b.rank) {
    return 0;
  } else if (a.rank < b.rank) {
    return -1;
  } else {
    return 1;
  }
}

export const adapter: EntityAdapter<IPlayerRating> = createEntityAdapter<IPlayerRating>({
  selectId: player => player.fide_id,
  sortComparer: sortByRankNumber,
});

export const initialState: State = adapter.getInitialState({
  selectedPlayerId: null
});

export function reducer(
  state = initialState,
  action: PlayerRatingActions
): State {
  switch (action.type) {
    case PlayerRatingActionTypes.AddRatings: {
      return adapter.addMany(action.payload.playerRatings, state);
    }

    case PlayerRatingActionTypes.LoadRatings: {
      return adapter.addAll(action.payload.playerRatings, state);
    }

    case PlayerRatingActionTypes.ClearRatings: {
      return adapter.removeAll(state);
    }

    default: {
      return state;
    }
  }
}

export const selectPlayerRatingsStore = createFeatureSelector<State>('player-rating');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectPlayerRatingsStore);
