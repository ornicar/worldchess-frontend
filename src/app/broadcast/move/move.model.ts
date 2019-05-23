
export interface CurrentMovesOnBoards {
  [boardId: string]: number; // move id
}

export interface SortedMovesOnBoards {
  [boardId: string]: number[]; // moves ids
}

export interface IMovePosition {
  fen: string;
  san: string;
  move_number: number;
  is_white_move: boolean;
}

export interface IPredictPosition extends IMovePosition {
  fen: string;
  san: string;
  move_number: number;
  is_white_move: boolean;
}

export interface IMovePrediction {
  score: number;
  positions: IPredictPosition[];
}

export enum PGNSpecialSymbol {
  GOOD_MOVE = '!',
  BAD_MOVE = '?',
  QUESTIONABLE = '?!',
  HIGHLIGHTED = '!?',
  CHECK = '+',
  MATE = '#'
}

export enum MoveReaction {
  BLUNDER = 1,
  MISTAKE = 2,
  MAJOR_CHANGE_OF_SITUATION = 3,
  CHECK = 4,
  VERY_LONG_THINKING_TIME = 5,
  MATE_IN_GT_10 = 6,
  MATE_IN_LS_10 = 7
}

export interface IMove extends IMovePosition {
  id: number;
  board: number;
  move_number: number;
  is_white_move: boolean;
  fen: string;
  figure: string;
  san: string;
  pgn_special_symbol?: PGNSpecialSymbol;
  created: string;
  time_spent?: string;
  time_left?: string;
  seconds_spent: number;
  seconds_left: number;
  total_spent: number;
  stockfish_score?: number;
  prediction?: IMovePrediction[];
  reaction?: MoveReaction;
}
