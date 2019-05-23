import { IPlayer } from '../player/player.model';

export interface IResultRecord {
  'white_player'?: IPlayer;
  'black_player'?: IPlayer;
  'white_player_name'?: string;
  'black_player_name'?: string;
  'result': Result | null;
  'board_type': number;
}

export interface IResultsLists {
  'Classic': IResultRecord[];
  'Rapid': IResultRecord[];
  'Blitz': IResultRecord[];
  'Armageddon': IResultRecord[];
}

export enum Result {
  WHITE_WIN = 1,
  DRAW = 2,
  BLACK_WIN = 3,
  NOT_PLAYED = 4,
}

export interface IPlayerResults {
  games: number;
  wins: number;
  draw: number;
  loss: number;
  total: number;
  player?: IPlayer;
}
