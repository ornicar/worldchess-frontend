export enum TypeChat {
  TOURNAMENT = 'tournament',
  GAME = 'game'
}

export interface INewMessage {
  id: number;
  userId: number;
  isNew: boolean;
  isChat: boolean;
  isFirst: boolean;
}

export enum TimeLimitWarningType {
  NoTimeLimitWarning,
  IdleTimeLimitWarning,
  EndGameTimeLimitWarning
}

export enum RatingMode {
  WC_rapid = 'worldchess_rapid',
  WC_bullet = 'worldchess_bullet',
  WC_blitz = 'worldchess_blitz',
  FIDE_rapid = 'fide_rapid',
  FIDE_bullet = 'fide_bullet',
  FIDE_blitz = 'fide_blitz'
}
