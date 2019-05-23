export interface ITeam {
  id: number;
  name: string;
  short_name: string;
  federation: number;
  tournament: number;
  players?: number[];
}
