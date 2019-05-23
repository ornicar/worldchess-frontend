import {IMatch} from '../match/match.model';
import {IPlayer} from '../player/player.model';
import {ITour} from '../tour/tour.model';

export enum BoardStatus {
  EXPECTED = 1,
  GOES = 2,
  COMPLETED = 3
}

export enum BoardResult {
  VICTORY = 1,
  DRAW = 2,
  DEFEAT = 3,
  NOTHING = 4,
}

export enum BoardPlayerStatus {
  AWAITING = 'awaiting',
  WHITE = 'white',
  BLACK = 'black',
  READY = 'ready',
}

export interface IBoard {
  id: number;
  tour?: ITour['id'];
  match?: IMatch['id'];
  slug: string;
  date_of_board?: string;
  status: BoardStatus;
  result?: BoardResult;
  white_player?: number | IPlayer;
  white_player_name?: string;
  black_player?: number | IPlayer;
  black_player_name?: string;
  player_status?: BoardPlayerStatus;
  pgn_file?: number;
  end_time?: string;
  last_notification?: string;
}

export interface IBoardWithExpandAll {
  id: number;
  tour: ITour['id'];
  match?: IMatch['id'];
  slug: string;
  date_of_board?: string;
  status: BoardStatus;
  result?: BoardResult;
  white_player?: IPlayer;
  white_player_name?: string;
  black_player?: IPlayer;
  black_player_name?: string;
  pgn_file: number;
  end_time?: string;
  last_notification?: string;
}

export interface IBoardState {
  id: number;
  status: BoardStatus;
  result: BoardResult;
  end_time?: string;
  last_notification?: string;
}

export interface IBoardPGN {
  id: number;
  pgn_file: {
    id: number,
    file_name: string,
    file_path: string,
  };
}
