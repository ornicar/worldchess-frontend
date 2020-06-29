import { GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import { IPlayerRatingProfile } from '@app/modules/app-common/services/player-rating.model';
import { ChessColors } from '@app/modules/game/state/game-chess-colors.model';

export interface IPlayerInQueue {
  created: string;
  uid: string;
  player_rating: number;
  rating: GameRatingMode[];
  time_control: ITimeControl[];
  desired_color: ChessColors;
  profile: IPlayerRatingProfile;
  invite_code: string;
  opp_mode: PlayerQueueOpponentMode;
  avatar: string;
  worldchess_rapid: number;
  worldchess_bullet: number;
  worldchess_blitz: number;
  fide_rapid: number;
  fide_bullet: number;
  fide_blitz: number;
}

export interface IPlayerRatingProfile {
  avatar: { full: string };
  full_name: string;
  birth_date: string;
  country: number;
}

export enum PlayerQueueOpponentMode {
  bot = 'bot',
  human = 'human',
  friend = 'friend'
}
