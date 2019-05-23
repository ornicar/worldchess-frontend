import {EntityState, EntityAdapter, createEntityAdapter, Update} from '@ngrx/entity';
import {CurrentMovesOnBoards, IMove, IMovePosition, IPredictPosition, SortedMovesOnBoards} from './move.model';
import { MoveActions, MoveActionTypes } from './move.actions';
import {createFeatureSelector, createSelector} from '@ngrx/store';

export interface State extends EntityState<IMove> {
  enableAutoSelect: boolean;
  boardNotLastMoveSelected: { [key: number]: boolean };
  selectedIds: CurrentMovesOnBoards;
  selectedPredictPosition: IPredictPosition;
}

export function sortByMoveOrder(a: IMovePosition, b: IMovePosition): number {
  const moveNumberCompare = a.move_number - b.move_number;

  if (moveNumberCompare !== 0) {
    return moveNumberCompare;
  } else if (a.is_white_move === b.is_white_move) {
    return 0;
  } else if (a.is_white_move && !b.is_white_move) {
    return -1;
  } else {
    return 1;
  }
}

export function sortMoveByBoardId(a: IMove, b: IMove): number {
  if (a.board === b.board) {
    return 0;
  } else {
    return a.board - b.board;
  }
}

export const adapter: EntityAdapter<IMove> = createEntityAdapter<IMove>({
  sortComparer: (a: IMove, b: IMove) => {
    const moveOrderCompare = sortByMoveOrder(a, b);

    return moveOrderCompare !== 0 ? moveOrderCompare : sortMoveByBoardId(a, b);
  }
});

export const initialState: State = adapter.getInitialState({
  enableAutoSelect: true,
  boardNotLastMoveSelected: {},
  selectedIds: {},
  selectedPredictPosition: null
});

const selectMove = (id, state) => state.entities[id];

const updateSelectedIdsWhenIdChanged = (moves: Update<IMove>[], state: State): State => {
  moves.forEach(move => {
    // Update selected when id changed.
    if (move.id !== move.changes.id) {
      const prevMove = selectMove[move.id];

      // And when this move was selected.
      if (prevMove && state.selectedIds[prevMove.board] === prevMove.id) {
        state = {
          ...state,
          selectedIds: {
            ...state.selectedIds,
            [prevMove.board]: move.changes.id
          }
        };
      }
    }
  });

  return state;
};

const removeSelectedIds = (ids: number[], state: State): State => {
  ids.forEach(id => {
    const prevMove = selectMove[id];

    // When this move was selected.
    if (prevMove && state.selectedIds[prevMove.board] === prevMove.id) {
      const selectedIds = { ...state.selectedIds };

      delete selectedIds[prevMove.board];

      state = {
        ...state,
        selectedIds
      };
    }
  });

  return state;
};

export function reducer(
  state = initialState,
  action: MoveActions
): State {
  switch (action.type) {
    case MoveActionTypes.AddMove: {
      return adapter.addOne(action.payload.move, state);
    }

    case MoveActionTypes.AddMoves: {
      return adapter.addMany(action.payload.moves, state);
    }

    case MoveActionTypes.UpdateMove: {
      state = updateSelectedIdsWhenIdChanged([action.payload.move], state);

      return adapter.updateOne(action.payload.move, state);
    }

    case MoveActionTypes.UpsertMove: {
      state = updateSelectedIdsWhenIdChanged([{id: action.payload.move.id, changes: action.payload.move}], state);

      return adapter.upsertOne(action.payload.move, state);
    }

    case MoveActionTypes.UpdateMoves: {
      state = updateSelectedIdsWhenIdChanged(action.payload.moves, state);

      return adapter.updateMany(action.payload.moves, state);
    }

    case MoveActionTypes.DeleteMove: {
      state = removeSelectedIds([action.payload.id], state);
      state = adapter.removeOne(action.payload.id, state);

      return state;
    }

    case MoveActionTypes.DeleteMoves: {
      state = removeSelectedIds(action.payload.ids, state);
      state = adapter.removeMany(action.payload.ids, state);

      return state;
    }

    case MoveActionTypes.LoadMoves: {
      state = adapter.addAll(action.payload.moves, state);

      return {
        ...state,
        selectedIds: {},
        boardNotLastMoveSelected: {}
      };
    }

    case MoveActionTypes.ClearMoves: {
      state = adapter.removeAll(state);

      return {
        ...state,
        selectedIds: {},
        boardNotLastMoveSelected: {}
      };
    }

    case MoveActionTypes.SetSelectedMove: {
      const move = state.entities[action.payload.id];
      const lastMove = (<number[]>state.ids).filter(id => state.entities[id].board === move.board).pop();

      if (move) {
        state = {
          ...state,
          selectedIds: {
            ...state.selectedIds,
            [move.board]: move.id
          },
          boardNotLastMoveSelected: {
            ...state.boardNotLastMoveSelected,
            [move.board]: move.id !== lastMove
          }
        };
      }

      return state;
    }

    case MoveActionTypes.SetPredictedMove: {
      const { predictPosition } = (action as any).payload;

      return {
        ...state,
        selectedPredictPosition: predictPosition
      };
    }

    case MoveActionTypes.ClearPredictedMove: {
      return {
        ...state,
        selectedPredictPosition: null
      };
    }

    case MoveActionTypes.EnableAutoSelectMove: {
      return {
        ...state,
        enableAutoSelect: true
      };
    }

    case MoveActionTypes.DisableAutoSelectMove: {
      return {
        ...state,
        enableAutoSelect: false
      };
    }

    default: {
      return state;
    }
  }
}


export const selectMoveStore = createFeatureSelector<State>('move');

export const selectSelectedIds = createSelector(selectMoveStore, state => state.selectedIds);

export const selectedPredictPosition = createSelector(selectMoveStore, state => state.selectedPredictPosition);

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectMoveStore);

export const selectBoardMovesIds = () => createSelector(
  selectAll,
  (entities, {boardId}) => entities
    .filter(move => move.board === boardId)
    .map(({id}) => id)
);

export const selectBoardMoves = () => {
  return createSelector(
    selectAll,
    (entities, {boardId}) => entities.filter(move => move.board === boardId)
  );
};

export const selectBoardsMoves = () => {
  return createSelector(
    selectAll,
    (entities, {boardsIds}: {boardsIds: number[]}) => entities.filter(move => boardsIds.includes(move.board))
  );
};

export const selectBoardPlayerLastMove = () => {
  return createSelector(
    selectAll,
    (entities, {boardId, playerColorIsWhite}) => entities
      .filter(move => move.board === boardId && move.is_white_move === playerColorIsWhite)
      .pop()
  );
};

export const selectBoardLastMove = () => {
  return createSelector(
    selectAll,
    (entities, {boardId}) => entities
      .filter(move => move.board === boardId)
      .pop()
  );
};

const cacheMapGroupMoves = new WeakMap();
const emptyGroupArray = [];

const getGroupedMovePair = (white, black) => {
  let cache = cacheMapGroupMoves.get(white);

  if (!cache || cache[1] !== black) {
    cache = [white, black];
    if (white) {
      cacheMapGroupMoves.set(white, cache);
    }
  }

  return cache;
};

export const groupMoves = (moves: IMovePosition[]): Array<[IMovePosition, IMovePosition]> => {
  if (moves.length) {
    const groupedMoves = [];
    let i = 0;

    while (i < moves.length) {
      let [white, black] = moves.slice(i, i + 2);

      // set only a black move when a white move is missed.
      if (!white.is_white_move) {
        [white, black] = [null, white];
      }

      // set only a white move when a black move is missed.
      if (black && black.is_white_move) {
        black = null;
      }

      groupedMoves.push(getGroupedMovePair(
        white,
        black
      ));

      // go to next pair only when we have white and black moves.
      i += white && black ? 2 : 1;
    }

    return groupedMoves;
  }

  return emptyGroupArray;
};

export const selectBoardGroupedMoves = () => {

  return createSelector(
    selectBoardMoves(),
    (moves: IMove[]) => groupMoves(moves)
  );
};

export const selectSelectedMoveId = () => createSelector(
  selectSelectedIds,
  (selectedIds, { boardId }) => selectedIds ? selectedIds[boardId] : null
);

export const selectSelectedMove = () => createSelector(
  selectEntities,
  selectSelectedMoveId(),
  (entities, selectedId) => selectedId ? entities[selectedId] : null
);
