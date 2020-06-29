export enum PlayerLabel {
  KING = '#1',
  BLITZ = 'blitz',
  RAPID = 'rapid',
  WOMAN = 'woman',
  GAIN = 'gain',
  LOST = 'lost',
  YOUNGEST = 'youngest',
  OLDEST = 'oldest',
  ACTIVE = 'active',
}

export interface IPlayerRatingProfile {
  avatar?: { [key: string]: string };
  full_name?: string;
  birth_date?: string;
  federation?: number;
  country?: number;
  user_id?: number | null;
  fide_id?: number | null;
  is_friend?: boolean;
}


export interface IPlayerRatingFooterData {
  rating: number;
  title: string;
  federation: number;
  birth_date?: string | number;
}

export interface IPlayerCompetitors {
  blitz_rating?: number | null;
  rapid_rating?: number | null;
  rating?: number | null;
  fide_blitz?: number | null;
  fide_bullet?: number | null;
  fide_rank?: number | null;
  fide_rapid?: number;
  worldchess_blitz?: number;
  worldchess_bullet?: number;
  worldchess_rank?: number;
  worldchess_rapid?: number;
  player_id: number;
  profile: IPlayerRatingProfile;
}

export interface IPlayerRatingItem {
  /**
   * title: Fide blitz
   * readOnly: true
   * default: 1200
   */
  fide_blitz?: number;

  /**
   * title: Fide bullet
   * readOnly: true
   * default: 1200
   */
  fide_bullet?: number;

  fide_competitors: Array<IPlayerCompetitors>;

  /**
   * title: Fide rapid
   * readOnly: true
   * default: 1200
   */
  fide_rapid?: number;

  profile?: IPlayerRatingProfile;

  worldchess_blitz?: number;

  worldchess_bullet?: number;

  worldchess_competitors: Array<IPlayerCompetitors>;

  worldchess_rapid?: number;

  player_id?: number;

  rank?: number;

  fide_rank?: number;

  worldchess_rank?: number;

  rating?: number;

  blitz_rating?: number;

  rapid_rating?: number;

}

export interface IPlayerRanks {
  world: number;
  national: number;
  continent: number;
}

export interface IPlayerRatingGroup {
  fide: IPlayerRating;
  fide_online: IPlayerRatingItem;
  worldchess: IPlayerRatingItem;
}

export interface  IPlayerRating {
  fide_id: number;
  rank: number;
  full_name: string;
  birth_year: number;
  rating: number;
  blitz_rating: number;
  rapid_rating: number;
  avatar: string;
  portrait: string;
  labels: PlayerLabel[];
  federation: number;
  title: string;
  ranks?: IPlayerRanks;
  worldchess_bullet?: number;
  fide_bullet?: number;
}


export interface IPlayerRatingFIDE {
  count?: number;
  next?: string;
  previous?: string;
  results?: IPlayerRatingItem[];
}
export interface IPlayerRatingWorldChess {
  count?: number;
  next?: string;
  previous?: string;
  results?: IPlayerRatingItem[];
}

export interface IPlayerRatingWorldChessItem {
  profile?: IPlayerRatingProfile;
  /**
   * title: Worldchess bullet
   * readOnly: true
   * default: 1200
   */
  worldchess_bullet?: number;
  /**
   * title: Worldchess rapid
   * readOnly: true
   * default: 1200
   */
  worldchess_rapid?: number;
  /**
   * title: Worldchess blitz
   * readOnly: true
   * default: 1200
   */
  worldchess_blitz?: number;

  wordlchess_rank?: number;

  fide_blitz?: number;

  fide_bullet?: number;

  fide_rank?: number;

  fide_rapid?: number;

}

export enum RatingTypeGame {
  CLASSIC = 'classic',
  BLITZ = 'blitz',
  RAPID = 'rapid',
  BULLET = 'bullet',
  FIDE_BULLET = 'fide_bullet',
  FIDE_BLITZ = 'fide_blitz',
  FIDE_RAPID = 'fide_rapid',
  WORLDCHESS_BULLET = 'worldchess_bullet',
  WORLDCHESS_BLITZ = 'worldchess_blitz',
  WORLDCHESS_RAPID = 'worldchess_rapid',
}

export interface IPlayerRatingOnDate {
  date: string;
  rating: string;
}

export interface IGameStats {
  [color: string]: {name: string, value: number}[];
}

export interface  IPlayerRatingStats {
  ratings: {
    [RatingTypeGame.CLASSIC]?: IPlayerRatingOnDate[],
    [RatingTypeGame.BULLET]?: IPlayerRatingOnDate[],
    [RatingTypeGame.BLITZ]: IPlayerRatingOnDate[],
    [RatingTypeGame.RAPID]: IPlayerRatingOnDate[],
  } | null;
  game_stats: {
    [RatingTypeGame.CLASSIC]?: IGameStats;
    [RatingTypeGame.BULLET]?: IGameStats;
    [RatingTypeGame.BLITZ]: IGameStats;
    [RatingTypeGame.RAPID]: IGameStats;
  } | null;
}

export interface IStats {
  total?: number,
  wins?: number,
  defeats?: number,
  draws?: number,
  wins_percentage?: number,
  defeats_percentage?: number,
  draws_percentage?: number
}

export interface IPlayerStats {
  prifile?: IPlayerRatingProfile
  stats?:IStats
}
