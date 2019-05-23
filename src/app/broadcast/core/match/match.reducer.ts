import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {IDefaultEntities} from '../models/default-entities';
import {MatchActions, MatchActionTypes} from './match.actions';
import {IMatch} from './match.model';

export interface State extends EntityState<IMatch> {
  selectedMatchId: number;
  defaults: {
    [id: number]: IDefaultEntities
  };
}

export function sortByMatchNumber(a: IMatch, b: IMatch): number {
  if (a.match_number === b.match_number) {
    return 0;
  } else if (a.match_number < b.match_number) {
    return -1;
  } else {
    return 1;
  }
}

export const adapter: EntityAdapter<IMatch> = createEntityAdapter<IMatch>({
  sortComparer: sortByMatchNumber
});

export const initialState: State = adapter.getInitialState({
  selectedMatchId: null,
  defaults: {}
});

export function reducer(
  state = initialState,
  action: MatchActions
): State {
  switch (action.type) {
    case MatchActionTypes.AddMatch: {
      return adapter.addOne(action.payload.match, state);
    }

    /*case MatchActionTypes.UpsertMatch: {
      return adapter.upsertOne(action.payload.match, state);
    }*/

    case MatchActionTypes.AddMatches: {
      return adapter.addMany(action.payload.matches, state);
    }

    /*case MatchActionTypes.UpsertMatches: {
      return adapter.upsertMany(action.payload.matches, state);
    }*/

    case MatchActionTypes.UpdateMatch: {
      return adapter.updateOne(action.payload.match, state);
    }

    case MatchActionTypes.UpdateMatches: {
      return adapter.updateMany(action.payload.matches, state);
    }

    case MatchActionTypes.DeleteMatch: {
      return adapter.removeOne(action.payload.id, state);
    }

    case MatchActionTypes.DeleteMatches: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case MatchActionTypes.LoadMatches: {
      return adapter.addAll(action.payload.matches, state);
    }

    case MatchActionTypes.ClearMatches: {
      return adapter.removeAll(state);
    }

    case MatchActionTypes.AddMatchDefaultEntities: {
      return {
        ...state,
        defaults: {
          ...state.defaults,
          [action.payload.id]: action.payload.defaults
        }
      };
    }

    case MatchActionTypes.SetSelectedMatch: {
      return {
        ...state,
        selectedMatchId: action.payload.id
      };
    }

    case MatchActionTypes.ClearSelectedMatch: {
      return {
        ...state,
        selectedMatchId: null
      };
    }

    default: {
      return state;
    }
  }
}

export const selectMatchStore = createFeatureSelector<State>('match');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectMatchStore);

export const selectSelectedMatchId = createSelector(selectMatchStore, store => store.selectedMatchId);

/**
 * @deprecated
 */
export const selectSelectedMatch = createSelector(selectEntities, selectSelectedMatchId, (entities, id) => entities[id]);

export const selectMatch = () => createSelector(selectEntities, (entities, { matchId }) => entities[matchId]);

export const selectMatchesDefaultEntities = createSelector(selectMatchStore, store => store.defaults);
