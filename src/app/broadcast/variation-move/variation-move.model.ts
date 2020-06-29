import { IMove, IMovePosition, IMovePrediction } from '../move/move.model';

export interface IVariationMove extends IMovePosition {
  primary_key: string;
  move: IMove['id'];
  move_number: number;
  is_white_move: boolean;
  fen: string;
  san: string;
  stockfish_score: number;
  prediction: IMovePrediction[];
}

export interface IVariationMovePredictionResponse {
  primary_key: string;
  stockfish_score: number;
  prediction: IMovePrediction[];
}

export type IVariationMovesPair = [IVariationMove, IVariationMove];
