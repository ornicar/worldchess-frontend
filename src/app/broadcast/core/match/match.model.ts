import {IDefaultEntities} from '../models/default-entities';

export interface IMatch {
  id: number;
  current_score?: string;
  match_number: number;
  status: 1 | 2 | 3; // @todo Create enum.
  tour: number;
  first_team: number;
  second_team: number;
}

export interface IMatchWithDefaults extends IMatch {
  defaults: IDefaultEntities;
}
