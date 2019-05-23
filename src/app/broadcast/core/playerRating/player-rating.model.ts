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

export interface IPlayerRanks {
  world: number;
  national: number;
  continent: number;
}

export interface IPlayerRating {
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
}
