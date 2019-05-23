import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {PlayerActions, PlayerActionTypes} from './player.actions';
import {IPlayer} from './player.model';

export interface State extends EntityState<IPlayer> {
  // additional entities state properties
}

export const adapter: EntityAdapter<IPlayer> = createEntityAdapter<IPlayer>({
  selectId: player => player.fide_id
});

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(
  state = initialState,
  action: PlayerActions
): State {
  switch (action.type) {
    case PlayerActionTypes.AddPlayer: {
      return adapter.addOne(action.payload.player, state);
    }

    /*case PlayerActionTypes.UpsertPlayer: {
      return adapter.upsertOne(action.payload.player, state);
    }*/

    case PlayerActionTypes.AddPlayers: {
      return adapter.addMany(action.payload.players, state);
    }

    /*case PlayerActionTypes.UpsertPlayers: {
      return adapter.upsertMany(action.payload.players, state);
    }*/

    case PlayerActionTypes.UpdatePlayer: {
      return adapter.updateOne(action.payload.player, state);
    }

    case PlayerActionTypes.UpdatePlayers: {
      return adapter.updateMany(action.payload.players, state);
    }

    case PlayerActionTypes.DeletePlayer: {
      return adapter.removeOne(action.payload.id, state);
    }

    case PlayerActionTypes.DeletePlayers: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case PlayerActionTypes.LoadPlayers: {
      return adapter.addAll(action.payload.players, state);
    }

    case PlayerActionTypes.ClearPlayers: {
      return adapter.removeAll(state);
    }

    case PlayerActionTypes.LoadPlayersById: {
      return adapter.addMany(action.payload.players, state);
    }

    default: {
      return state;
    }
  }
}

export const selectPlayerStore = createFeatureSelector<State>('player');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectPlayerStore);

export const selectPlayerById = () => createSelector(selectEntities, (entities, { playerId }) => entities[playerId]);

export const selectPlayersByIds = () =>
  createSelector(selectEntities, (entities, { playerIds }) =>
    playerIds
      .map(playerId => entities[playerId])
      .filter(entity => Boolean(entity))
  );
