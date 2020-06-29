
export enum playerRank {
  GRANDMASTER = 'GM',
  WOMAN_GRANDMASTER = 'WGM',
  INTERNATIONAL_MASTER = 'IM',
  WOMAN_INTERNATIONAL_MASTER = 'WIM',
  FIDE_MASTER = 'FM',
  WOMAN_FIDE_MASTER = 'WFM'
}

export interface IPlayerAvatar {
  full: string;
}

export interface IPlayer {
  fide_id: number;
  full_name: string;
  nickname?: string;
  birth_year?: string;
  rank?: playerRank;
  rating?: number;
  blitz_rating?: number;
  rapid_rating?: number;
  avatar?: IPlayerAvatar;
  portrait?: string;
  portrait_fullface?: string;
  federation?: number;
  uid?: string;
  id?: number;
  is_male?: boolean;
  nationality_id?: number;
}

