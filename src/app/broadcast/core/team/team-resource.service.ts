import {HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment';
import {ITeam} from './team.model';

@Injectable()
export class TeamResourceService {

  constructor(private http: HttpClient) { }

  get(id: number) {
    return this.http.get<ITeam>(`${environment.endpoint}/teams/${id}/`);
  }

  getByTournamentId(id: number) {
    return this.http.get<ITeam[]>(`${environment.endpoint}/tournaments/${id}/teams/`);
  }
}
