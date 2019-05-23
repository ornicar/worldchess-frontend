import {IDefaultEntities} from '../models/default-entities';

export enum TourStatus {
  EXPECTED = 1,
  GOES = 2,
  COMPLETED = 3
}

export enum BoardType {
  CLASSIC = 1,
  RAPID = 2,
  BLITZ = 3,
  ARMAGEDDON = 4
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

export interface ITimeControl {
  id?: number;
  start_time: string;
  black_start_time?: string;
  additional_time: string;
  increment: string;
  additional_time_move: number;
  increment_start_move: number;
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
}

export interface ITourWithDefaults extends ITour {
  defaults: IDefaultEntities;
}
