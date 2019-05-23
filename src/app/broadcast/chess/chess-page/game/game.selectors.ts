import {createSelector, defaultMemoize} from '@ngrx/store';
import {selectedPredictPosition, selectSelectedMove} from '../../../move/move.reducer';
import {selectSelectedVariationMoveOfBoard, selectVariationMovesIsActive} from '../../../variation-move/variation-move.reducer';
import {BoardStatus} from '../../../core/board/board.model';
import * as fromBoard from '../../../core/board/board.reducer';
import {IGameState} from './game.model';

// @TODO разбить на base селектор (board & move) и доп, селеткоры (predict, variations)
export const selectGameState = () => {
  const gameStateSelector = createSelector(
    fromBoard.selectBoard(),
    selectSelectedMove(),
    selectSelectedVariationMoveOfBoard(),
    selectedPredictPosition,
    selectVariationMovesIsActive,
    (...params) => params
  );

  const game = defaultMemoize((
    board,
    selectedMove,
    selectedVariationMove,
    selectedPredictMove,
    myGameIsActive
  ) => ({
    board,
    isExpected: board ? board.status === BoardStatus.EXPECTED : false,
    isNotExpected: board ? board.status !== BoardStatus.EXPECTED : false,
    selectedMove,
    selectedVariationMove,
    selectedPredictMove,
    myGameIsActive
  }));

  return createSelector( (state, { boardId }): IGameState => {
    const [
      board,
      selectedMove,
      selectedVariationMove,
      selectedPredictMove,
      myGameIsActive
    ] = gameStateSelector(state, { boardId });

    return game.memoized(
      board,
      selectedMove,
      selectedVariationMove,
      selectedPredictMove,
      myGameIsActive
    );
  });
};
