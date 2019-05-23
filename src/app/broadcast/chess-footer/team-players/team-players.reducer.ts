import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {TeamPlayersActions, TeamPlayersActionTypes} from './team-players.actions';
import {ITeamPlayer} from './team-players.model';

export interface State extends EntityState<ITeamPlayer> {
  count: number;
  selectedTeamPlayers: ITeamPlayer[];
}

export const adapter: EntityAdapter<ITeamPlayer> = createEntityAdapter<ITeamPlayer>();

export const initialState: State = adapter.getInitialState({
  count: 0,
  selectedTeamPlayers: []
});

export function reducer(
  state = initialState,
  action: TeamPlayersActions
): State {
  switch (action.type) {

    case TeamPlayersActionTypes.AddTeamPlayers: {
      const { teamPlayers, count } = action.payload;
      const newState = {
        ...state,
        count
      };
      return adapter.addMany(teamPlayers, newState);
    }

    case TeamPlayersActionTypes.ClearTeamPlayers: {
      const newState = {
        ...state,
        count: 0
      };
      return adapter.removeAll(newState);
    }

    case TeamPlayersActionTypes.LoadSelectedTeamPlayers: {
      return {
        ...state,
        selectedTeamPlayers: action.payload.teamPlayers
      };
    }

    case TeamPlayersActionTypes.ClearSelectedTeamPlayers: {
      return {
        ...state,
        selectedTeamPlayers: []
      };
    }
    default: {
      return state;
    }
  }
}

export const selectTeamPlayersState = createFeatureSelector<State>('teamPlayers');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectTeamPlayersState);

export const selectSelectedTeamPlayers = createSelector(selectTeamPlayersState, state => state.selectedTeamPlayers);
export const selectTeamPlayersCount = createSelector(selectTeamPlayersState, state => state.count);
