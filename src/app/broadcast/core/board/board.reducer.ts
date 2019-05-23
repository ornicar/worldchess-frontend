import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { IBoard } from './board.model';
import { BoardActions, BoardActionTypes } from './board.actions';
import {createFeatureSelector, createSelector} from '@ngrx/store';

export interface State extends EntityState<IBoard> {
}

export const adapter: EntityAdapter<IBoard> = createEntityAdapter<IBoard>();

export const initialState: State = adapter.getInitialState({
});

export const getPlayersIdsByBoard = (board: IBoard): number[] => {
  const ids = [];

  if (board.white_player) {
    ids.push(board.white_player);
  }

  if (board.black_player) {
    ids.push(board.black_player);
  }

  return ids;
};

export function reducer(
  state = initialState,
  action: BoardActions
): State {
  switch (action.type) {
    case BoardActionTypes.AddBoard: {
      return adapter.addOne(action.payload.board, state);
    }

    case BoardActionTypes.UpsertBoard: {
      return adapter.upsertOne(action.payload.board, state);
    }

    case BoardActionTypes.AddBoards: {
      return adapter.addMany(action.payload.boards, state);
    }

    /*case BoardActionTypes.UpsertBoards: {
      return adapter.upsertMany(action.payload.boards, state);
    }*/

    case BoardActionTypes.UpdateBoard: {
      return adapter.updateOne(action.payload.board, state);
    }

    case BoardActionTypes.UpdateBoards: {
      return adapter.updateMany(action.payload.boards, state);
    }

    case BoardActionTypes.DeleteBoard: {
      return adapter.removeOne(action.payload.id, state);
    }

    case BoardActionTypes.DeleteBoards: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case BoardActionTypes.LoadBoards: {
      return adapter.addAll(action.payload.boards, state);
    }

    case BoardActionTypes.ClearBoards: {
      return adapter.removeAll(state);
    }

    default: {
      return state;
    }
  }
}

export const selectBoardStore = createFeatureSelector<State>('board');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectBoardStore);

export const selectBoard = () => createSelector(
  selectEntities,
  (boards, { boardId }) => boardId ? boards[boardId] : null
);

export const selectBoardsFromTour = () => createSelector(
  selectAll,
  (entities, { tourId }) => entities.filter(e => e.tour === tourId)
);

export const selectBoardLastNotification = () => createSelector(
  selectBoard(),
  (board) => board ? board.last_notification : ''
);

export const selectBoardById = createSelector(selectBoardStore, (state, { id }) => state.entities[id]);
