// import { IMove } from '@app/broadcast/move/move.model';

export interface IGameMove {
  fen: string;
  san: string;

  // TODO hide?
  move_number: number;
  is_white_move: boolean;
  created: string;
  time_spent?: string;
  time_left?: string;
  seconds_left?: number;
  seconds_spent?: number;
}

export enum CheckState {
  NoCheck,
  PlayerChecks,
  OpponentChecks
}

