export interface IGameMove {
  fen: string;
  san: string;
  move_number: number;
  is_white_move: boolean;
  created: string;
  time_spent?: string;
  time_left?: string;
  seconds_left?: number;
  seconds_spent?: number;
}
