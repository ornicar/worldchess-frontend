import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IPlayer } from './player.model';
import { Observable } from 'rxjs';
import { IPaginationResponse } from '../../chess-footer/team-players/team-players-resource.service';
import { map } from 'rxjs/operators';

@Injectable()
export class PlayerResourceService {

  constructor(private http: HttpClient) { }

  get(id: number) {
    return this.http.get<IPlayer>(`${environment.endpoint}/players/${id}/`);
  }

  getAll() {
    return this.http.get<IPlayer[]>(`${environment.endpoint}/players/`);
  }

  getMany(ids: number[]): Observable<IPlayer[]> {
    return this.http.get<IPaginationResponse<IPlayer>>(`${environment.endpoint}/players/?ids=${ids.join(',')}`).pipe(
      map(response => response.results)
    );
  }
}
