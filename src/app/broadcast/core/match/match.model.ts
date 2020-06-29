import {IDefaultEntities} from '../models/default-entities';
import { ITeam } from '@app/broadcast/core/team/team.model';

export interface IMatch {
  id: number;
  current_score?: string;
  match_number: number;
  status: 1 | 2 | 3; // @todo Create enum.
  tour: number;
  first_team: number;
  second_team: number;
}

export interface IMatchWithTeams extends IMatch {
  teams: [ITeam, ITeam];
}

export interface IMatchWithDefaults extends IMatch {
  defaults: IDefaultEntities;
}
