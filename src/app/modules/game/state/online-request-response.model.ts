import { ITimeControl, GameRatingMode } from '@app/broadcast/core/tour/tour.model';

export enum EDesiredColor {
  WHITE = 'white',
  BLACK = 'black'
}

export enum EOppMode {
  BOT = 'bot',
  HUMAN = 'human',
  FRIEND = 'friend'
}

export enum OnlineRequestResponseStatus {
  Success,
  SendingAttempts,
  Fail
}

export interface IOnlineRequestResponse {
  uid?: string;
  created?: string;
  invite_code?: string;
  player_uid?: string;
  rating?: number;
  opp_mode?: EOppMode;
  opp_uid?: string;
  time_control?: ITimeControl;
  desired_color?: EDesiredColor;
  responseStatus: OnlineRequestResponseStatus;
}


export interface IRequestInvite {
  uid?: string;
  created?: string;
  player_rating?: number;
  rating?: GameRatingMode[];
  time_contorl?: ITimeControl;
  ratingLimits?: any;
  desired_color?: EDesiredColor;
  opp_mode: EOppMode;
  invite_code?: string;
  player_uid: string;
}

export interface IRequestDeleteInvite {
  opp_uid?: string;
}

export interface IResponseInvite {
  uid?: string;
  created?: string;
  player_rating?: number;
  rating?: GameRatingMode[];
  time_contorl?: ITimeControl;
  rating_limits?: any;
  desired_color?: EDesiredColor;
  opp_mode?: EOppMode;
  invite_code?: string;
  player_uid?: string;
  errorCode?: number;
  errorMsg?: string;
}

export interface IChatID {
  chat_id: string;
}
