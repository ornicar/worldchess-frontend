import { CommonTournament } from '../../broadcast/core/tournament/tournament.model';
import { ISubscription } from '../../purchases/subscriptions/subscriptions.model';
import { IPurchasePlan } from '../../purchases/user-purchases/user-purchases.model';
import { IPlayer } from '@app/broadcast/core/player/player.model';


export interface IOrderProduct {
  tournament: CommonTournament;
  price: number;
  currency: string;
  product: string;
  stripe_id: string;
  status: number;
  created: string;
}


export interface IOrder {
  product: IOrderProduct;
  amount: number;
  currency: string;
  status: string;
  created: string;
}

export enum FounderStatus {
  NONE = 0,
  WAIT = 1,
  APPROVE = 2,
}

export enum AccountVerification {
  NOT_VERIFIED = 0,
  ON_CHECK = 1,
  VERIFIED = 2,
}

export interface IAccountSocial {
  facebook: string;
  instagram: string;
  twitter: string;
  mates: boolean;
}

export interface ISettingsGameAccount {
  board_style: IAccountGameBoardStyle;
  board_last_move_style: IAccountGameLastMove;
  board_legal_move_style: IAccountLegalMove;
  is_sound_enabled: boolean;
}

export interface IAccount  {
  id: number;
  email: string;
  full_name: string;
  nickname?: string;
  avatar: { [key: string]: string };
  premium: boolean;
  uid?: string;
  receive_newsletters: boolean;
  subscriptions: ISubscription[];
  orders: IOrder[];
  founder_approve_status: FounderStatus;
  birth_date?: string;
  country?: number;
  is_public?: boolean;
  social_accounts?: IAccountSocial;
  full_camera_access?: boolean;
  is_finalized?: boolean;
  fide_verified_status?: AccountVerification;
  fide_id?: number;
  //TODO: Нужны будет переделать на type
  board_style?: IAccountGameBoardStyle;
  board_last_move_style?: IAccountGameLastMove;
  board_legal_move_style?: IAccountLegalMove;
  is_sound_enabled?: boolean;
  fidelity_points?: number | null;
  player?: any;
  since?: string;
  language?: string | null;
}

export interface IAccountRating {
  since: string;
  fide_id?: number;
  verification?: AccountVerification;
  subscriptions: IPurchasePlan[];
  worldchess_rating: number;
  worldchess_bullet: number;
  worldchess_blitz: number;
  worldchess_rapid: number;
  fide_rating?: number;
  fide_bullet?: number;
  fide_blitz?: number;
  fide_rapid?: number;
}

export interface IAddFriend {
  friend_id: number;
}

export interface IFriend {
  friend_id: number;
  name: string;
}

export interface IAccountEmailChange {
  email: string;
  verification_code: number;
  new_token?: string;
}

export interface IExistFriend {
  result: boolean;
}

// Настройки доски по игре, пока будут тут
export enum IAccountGameBoardStyle {
  STANDARD = 'standard',
  WORLDCHESS = 'world_chess_board',
  TEXTBOOK = 'textbook'
}

export enum IAccountGameLastMove {
  DONTSHOW = 'non_showing',
  HIGHLIGHT = 'highlight',
  ARROW = 'arrow'
}

export enum IAccountLegalMove {
  DONTSHOW = 'non_showing',
  SHOWDOTS = 'show_with_dots'
}
