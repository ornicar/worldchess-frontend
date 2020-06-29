import { GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import { IPlayerRatingProfile } from '@app/modules/app-common/services/player-rating.model';

export interface IGameHistoryResponse {
  count: number;
  next: string;
  previous: string;
  results: IOnlinePlayerGameArchive[];
}

export interface IOnlinePlayerGameArchive {
  created: string;
  time_control: ITimeControl;
  rating: GameRatingMode;
  result: ArchiveGameResult;
  color: string;
  white_player_profile: IPlayerRatingProfile;
  black_player_profile: IPlayerRatingProfile;
  board_pgn: string;
  pgn_download_name: string;
}

export interface IPlayerRatingProfile {
  avatar: string;
  full_name: string;
  birth_date: string;
  country: number;
}

export enum ArchiveGameResult {
  Won = 1 ,
  Draw = 2,
  Lost = 3,
  None = 4,
}
