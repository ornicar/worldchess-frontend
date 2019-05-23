import {IMove, IPredictPosition} from '../../../move/move.model';
import {IVariationMove} from '../../../variation-move/variation-move.model';
import {IBoard} from '../../../core/board/board.model';

export interface IGameState {
  board?: IBoard;
  isExpected: boolean;
  isNotExpected: boolean;
  selectedMove?: IMove;
  selectedPredictMove?: IPredictPosition;
  selectedVariationMove?: IVariationMove;
  myGameIsActive: boolean;
}
