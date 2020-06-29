import { IOnlineTournament } from '@app/modules/game/tournaments/models/tournament.model';
import { GameRatingMode, ITimeControl, ITourMoves } from '@app/broadcast/core/tour/tour.model';
import {
  IOnlineTournamentTeamPlayer, TournamentResourceType, TournamentStatus,
  TournamentType
} from '@app/broadcast/core/tournament/tournament.model';
import { Moment } from 'moment';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { BoardResult, BoardStatus } from '@app/broadcast/core/board/board.model';
import { IDefaultEntities } from '@app/broadcast/core/models/default-entities';


export interface IPointsPerBoard {
  board_uid: string;
  points: number;
}

export interface IOnlineTournamentResponse {
  count: number;
  next: string;
  previous: string;
  results: IOnlineTournament[];
}

export interface IOnlineTournamentBoard {
  board_id: string;
  white_id: number;
  white_uid: string;
  white_fide_id: number | null;
  white_rating: number | null;
  white_is_bot: boolean;
  black_id: number;
  black_uid: string;
  black_fide_id: number;
  black_rating: number;
  start_time_in_seconds: number;
  black_is_bot: boolean;
  time_control: ITimeControl;
  tour_id: number;
  tournament_id: number;
  moves: ITourMoves[];
  result?: BoardResult;
  status: BoardStatus;
  white_player?: IPlayer;
  black_player?: IPlayer;
  black_seconds_left: number | null;
  white_seconds_left: number | null;
  desk_number?: number;
  created?: string;
  finished_at?: string | null;
}

export interface IOnlineTournamentBoards {
  count: number;
  next: string | null;
  previous: string | null;
  results: IOnlineTournamentBoard[];
}

export interface IOnlineTournament {
  id?: number;
  title?: string;
  additional_title?: string;
  slug?: string;
  location?: string;
  datetime_of_tournament?: string;
  datetime_of_finish?: string;
  tournament_type?: TournamentType;
  broadcast_type?: number;
  event?: number;
  prize_fund?: number;
  prize_fund_currency?: string;
  status?: TournamentStatus;
  image?: string;
  sharing_fb?: ILink;
  sharing_tw?: ILink;
  about?: string;
  press?: string;
  contacts?: string;
  product?: string;
  organized_by?: string;
  players_amount?: number;
  signup_datetime?: IBounds;
  user_signed?: boolean;
  available?: boolean;
  players_rating_minimum?: number;
  players_rating_maximum?: number;
  promoted?: boolean;
  time_control?: ITimeControl;
  signed_up_amount?: number;
  country?: number;
  rating_type?: GameRatingMode;
  number_of_tours?: number;
  resourcetype?: TournamentResourceType;
  defaults?: IDefaultEntities;
  signup_start_datetime?: string;
  signup_end_datetime?: string;
  signup_opened?: boolean;
  move_time_limit?: number;
  faq_text?: string;
  similar_tournaments?: any;
  tournament_online_players?: IOnlineTournamentTeamPlayer[];
  in_overlapped_tournament?: boolean;
  sponsor?: string;
  sponsor_title?: string;
}

export interface IOnlineTournamentSorted {
  id?: number;
  title?: string;
  additional_title?: string;
  slug?: string;
  location?: string;
  datetime_of_tournament?: string;
  datetime_of_finish?: string;
  comparable_datetime_of_finish?: string;
  tournament_type?: TournamentType;
  broadcast_type?: number;
  event?: number;
  prize_fund?: number;
  prize_fund_currency?: string;
  status?: number;
  image?: string;
  sharing_fb?: ILink;
  sharing_tw?: ILink;
  about?: string;
  press?: string;
  contacts?: string;
  product?: string;
  organized_by?: string;
  players_amount?: number;
  signup_datetime?: IBounds;
  user_signed?: boolean;
  available?: boolean;
  players_rating_minimum?: number;
  players_rating_maximum?: number;
  promoted?: boolean;
  time_control?: ITimeControl;
  signed_up_amount?: number;
  country?: number;
  rating_type?: GameRatingMode;
  momentTime?: Moment;
}

export interface ILink {
  full: string;
}

export interface IBounds {
  lower: string;
  upper: string;
  bounds: string;
}



export interface IOnlineTournamentStandings {
  avatar?: string;
  rank?: number;
  full_name?: string;
  rating?: number;
  age?: number;
  nationality_id?: number;
  player_uid?: string;
  player_id: number;
  points?: number;
  points_per_board?: IPointsPerBoard[];
}

export interface IOnlineTournamentState {
  id?: number;
  datetime_of_tournament?: string;
  status?: TournamentStatus;
  signup_start_datetime?: string;
  signup_end_datetime?: string;
  signup_opened?: boolean;
}

export interface IOnlineTournamentWidenStandings {
  player: IOnlineTournamentTeamPlayer;
  player_uid?: string;
  points?: number;
  points_per_board?: IPointsPerBoard[];
  rank?: number;
  rating?: number;
}

export interface IReadyResponse {
  id: number;
  white_player: IPlayer;
  black_player: IPlayer;
  agreement: null;
  desk_number: number;
  date_of_board: string;
  white_player_name: string;
  black_player_name: string;
  status: number;
  player_status: string;
  result: string;
  end_time: string;
  last_notification: string;
  tour: number;
  match: string;
  pgn_file: string;
}

export interface IOnlineTournmanetWidgetTimeBoard {
  blackTime?: string;
  whiteTime?: string;
}

export interface IUpdateMeResponse {
  status: EUpdateMeStatus;
  tournament_id: number;
  tour_id: number;
  board_uid: string;
  jwt: string;
  uid: string;
  chat_id: string;
  is_last_tour: boolean;
  is_first_tour: boolean;
}

export enum EUpdateMeStatus {
  WAITING_FOR_NEXT_TOUR = 'WAITING_FOR_NEXT_TOUR',
  GAME_IN_PROGRESS = 'GAME_IN_PROGRESS',
  GAMEOVER = 'GAMEOVER',
  TOURNAMENT_OVER = 'TOURNAMENT_OVER'
}
