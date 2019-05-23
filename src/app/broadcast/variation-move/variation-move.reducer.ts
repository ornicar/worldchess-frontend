import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {IMove} from '../move/move.model';
import {groupMoves, selectBoardMoves, selectSelectedMove, sortByMoveOrder} from '../move/move.reducer';
import {VariationMoveActionTypes, VariationMoveActions} from './variation-move.actions';
import {IVariationMove} from './variation-move.model';

export interface State extends EntityState<IVariationMove> {
  variationMovesIsActive: boolean;
  selected: {
    [id: number]: IVariationMove['primary_key']
  };
}

export function sortVariationMoveByMoveId(a: IVariationMove, b: IVariationMove): number {
  if (a.move === b.move) {
    return 0;
  } else {
    return a.move - b.move;
  }
}

export const adapter: EntityAdapter<IVariationMove> = createEntityAdapter<IVariationMove>({
  selectId: variationMove => variationMove.primary_key,
  sortComparer: (a: IVariationMove, b: IVariationMove) => {
    const moveOrderCompare = sortByMoveOrder(a, b);

    return moveOrderCompare !== 0 ? moveOrderCompare : sortVariationMoveByMoveId(a, b);
  }
});

export const initialState: State = adapter.getInitialState({
  variationMovesIsActive: false,
  selected: {}
});

const setSelectedVariationMove = (variationMove, state) => {
  if (state.selected[variationMove.move] !== variationMove.primary_key) {
    state = {
      ...state,
      selected: {
        ...state.selected,
        [variationMove.move]: variationMove.primary_key
      }
    };
  }

  return state;
};

export function reducer(
  state = initialState,
  action: VariationMoveActions
): State {

  switch (action.type) {
    case VariationMoveActionTypes.ActivateVariationMoves: {
      if (!state.variationMovesIsActive) {
        state = {
          ...state,
          variationMovesIsActive: true,
        };
      }

      return state;
    }

    case VariationMoveActionTypes.DeactivateVariationMoves: {
      if (state.variationMovesIsActive) {
        state = {
          ...state,
          variationMovesIsActive: false,
        };
      }

      return state;
    }

    case VariationMoveActionTypes.SetVariationMove: {
      const { variationMove } = action.payload;

      const removeIds = Object.keys(state.entities).filter(id => {
        const move = state.entities[id];

        const isSameMove = move.move === variationMove.move;
        const isSameMoveNumber = variationMove.is_white_move
          ? move.move_number === variationMove.move_number
          : move.move_number === variationMove.move_number && !move.is_white_move;

        const isNext = move.move_number > variationMove.move_number;

        // Select all stored moves that incompatible with the current move.
        return isSameMove && (isSameMoveNumber || isNext);
      });

      // Remove all incompatible moves.
      state = adapter.removeMany(removeIds, state);
      state = adapter.addOne(variationMove, state);

      return setSelectedVariationMove(variationMove, state);
    }

    case VariationMoveActionTypes.SetSelectedVariationMove: {
      return setSelectedVariationMove(action.payload.variationMove, state);
    }

    case VariationMoveActionTypes.ClearSelectedVariationMove: {
      const { moveId } = action.payload;

      if (state.selected[moveId]) {
        state = {
          ...state,
          selected: {
            ...state.selected,
            [moveId]: null
          }
        };
      }

      return state;
    }

    case VariationMoveActionTypes.UpdateVariationMove: {
      return adapter.updateOne(action.payload.variationMove, state);
    }

    default: {
      return state;
    }
  }
}

export const selectVariationMoveStore = createFeatureSelector<State>('variationMove');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectVariationMoveStore);

export const selectVariationMovesIsActive = createSelector(
  selectVariationMoveStore,
  ({variationMovesIsActive}) => variationMovesIsActive
);

export const selectVariationMovesGroupByMove = createSelector(selectAll, entities => {
  const grouped = {};

  for (const entity of entities) {
    (grouped[entity.move] = grouped[entity.move] || []).push(entity);
  }

  return grouped;
});

export const selectVariationMovesOfBoard = () => createSelector(
  selectVariationMovesIsActive,
  selectVariationMovesGroupByMove,
  selectBoardMoves(),
  (variationMovesIsActive, groupedEntities, moves) => {
    const accumulator = {};

    if (variationMovesIsActive) {
      for (const move of moves) {
        accumulator[move.id] = groupedEntities[move.id];
      }
    }

    return accumulator;
  }
);

export const selectGroupedVariationMovesOfBoard = () => createSelector(
  selectVariationMovesIsActive,
  selectVariationMovesGroupByMove,
  selectBoardMoves(),
  (variationMovesIsActive, groupedEntities, moves) => {
    const accumulator = {};

    if (variationMovesIsActive) {
      for (const move of moves) {
        accumulator[move.id] = groupedEntities[move.id] ? groupMoves(groupedEntities[move.id]) : null;
      }
    }

    return accumulator;
  }
);

export const selectSelectedVariationMoveOfBoard = () => createSelector(
  selectEntities,
  selectVariationMoveStore,
  selectSelectedMove(),
  (entities, { selected, variationMovesIsActive }, move: IMove): IVariationMove => {
    if (variationMovesIsActive ) {
      const id = move ? selected[move.id] : null;

      return id ? entities[id] : null;
    } else {
      return null;
    }
  }
);
