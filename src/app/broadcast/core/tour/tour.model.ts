import { IDefaultEntities } from '../models/default-entities';
import { IFounderCamera } from '../camera/camera.model';
import { IMovePrediction, MoveReaction, PGNSpecialSymbol } from '@app/broadcast/move/move.model';
import { BoardResult, BoardStatus } from '@app/broadcast/core/board/board.model';
import { IPlayer } from '@app/broadcast/core/player/player.model';

export enum TourStatus {
  EXPECTED = 1,
  GOES = 2,
  COMPLETED = 3
}

export enum BoardType {
  CLASSIC = 1,
  RAPID = 2,
  BLITZ = 3,
  ARMAGEDDON = 4,
  BULLET = 5
}

export const BoardTypeTimeWhite = {
  [BoardType.CLASSIC]: 90 * 60,
  [BoardType.RAPID]: 25 * 60,
  [BoardType.BLITZ]: 5 * 60,
  [BoardType.ARMAGEDDON]: 5 * 60
};

export const BoardTypeTimeBlack = {
  [BoardType.CLASSIC]: 90 * 60,
  [BoardType.RAPID]: 25 * 60,
  [BoardType.BLITZ]: 5 * 60,
  [BoardType.ARMAGEDDON]: 4 * 60
};

export enum GameRatingMode {
  UNRATED = 'non-rated',
  RATED = 'worldchess',
  FIDERATED = 'fide'
}

export interface ITimeControl {
  id?: number;
  start_time?: string;
  black_start_time?: string;
  additional_time?: string;
  increment?: string;
  additional_time_move?: number;
  increment_start_move?: number;
  board_type?: BoardType;
  start_time_in_seconds?: number;
  black_start_time_in_seconds?: number;
  additional_time_in_seconds?: number;
  increment_in_seconds?: number;
}

export interface ITimeControlWithBorderBottom {
  timecontrol: ITimeControl;
  needBorderBottom: boolean;
}

export interface ITimeControlTypeGroup {
  [id: number]: ITimeControl[];
}

export interface ITimeControlGrouped {
  board_type: BoardType;
  timeControls: ITimeControlWithBorderBottom[];
  topRounded: boolean;
  bottomRounded: boolean;
}

export interface ITour {
  id: number;
  datetime_of_round: string;
  datetime_of_round_finish: string;
  status: TourStatus;
  pgn_file: number;
  tour_number: number;
  tournament: number;
  board_type: BoardType;
  links?: Array<{link: string}>;
  time_control: ITimeControl;
  boards_count: number;
  tour_sub_number?: number;
  tour_round_name?: string;
  is_last?: boolean;
}

export interface ITourMoves {
  fen: string;
  san: string;
  created: string;
  time_spent?: string;
  time_left?: string;
  move_number: number;
  is_white_move: boolean;
  seconds_spent: number;
  seconds_left: number;
  total_spent: number;
  stockfish_score?: number;
  prediction?: IMovePrediction[];
  reaction?: MoveReaction;
}

export interface ITourWithDefaults extends ITour {
  defaults: IDefaultEntities;
}

export interface IFounderTour extends ITour {
  cameras: IFounderCamera[];
}
