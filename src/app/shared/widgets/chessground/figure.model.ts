export type TFigure = 'b' | 'k' | 'n' | 'p' | 'q' | 'r';

export const blackFigureWeights = {
  'p': 1,
  'b': 3,
  'n': 3,
  'r': 5,
  'q': 9
};

export const whiteFigureWeights = {
  'P': 1,
  'B': 3,
  'N': 3,
  'R': 5,
  'Q': 9
};

export enum CheckmateState {
  NoCheckmate,
  WhiteCheckmates,
  BlackCheckmates
}
