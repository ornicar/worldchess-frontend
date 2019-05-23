import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ITeamPlayer } from './team-players.model';
import { Observable } from 'rxjs';


export interface IPaginationResponse<T> { // @TODO Move to some base models file
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface IPaginationParams {
  limit?: string;
  offset?: string;
}

export interface ITeamPlayersParams extends IPaginationParams {
  tournament?: string;
  team_id?: string;
  expand?: 'player';
  limit?: string;
  offset?: string;
}

@Injectable()
export class TeamPlayerResourceService {

  constructor(private http: HttpClient) { }

  getWithParams(teamParams: ITeamPlayersParams = {}): Observable<IPaginationResponse<ITeamPlayer>> {
    const { team_id, tournament, expand, limit, offset } = teamParams;
    let params = {};
    if (team_id || tournament || expand || limit || offset ) {
      params = Object.assign({},  teamParams);
    }
    return this.http.get<IPaginationResponse<ITeamPlayer>>(`${environment.endpoint}/team-players/`, { params });
  }
}
