export interface ITeamPlayer {
  id: number;
  board_number: number;
  player: ITeamPlayerSerialization;
  team: number;
  tournament: number;
}

interface ITeamPlayerSerialization {
  fide_id: number;
  full_name: string;
  birth_year: number;
  rank: string;
  rating: number;
  avatar: string;
  federation: number;
}
