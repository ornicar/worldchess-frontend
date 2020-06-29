import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IPlayer } from './player.model';
import { Observable } from 'rxjs';
import { IPaginationResponse } from '../../chess-footer/team-players/team-players-resource.service';
import { map, shareReplay } from 'rxjs/operators';

@Injectable()
export class PlayerResourceService {

  constructor(private http: HttpClient) {
  }

  private allCache$: Observable<IPlayer[]>;
  private allCountCache$: Observable<number>;

  get(id: number) {
    return this.http.get<IPlayer>(`${environment.endpoint}/players/${id}/`);
  }

  getAll() {
    if (!this.allCache$) {
      this.allCache$ = this.http.get<IPlayer[]>(`${environment.endpoint}/players/`).pipe(
        shareReplay(1)
      );
    }
    return this.allCache$;
  }

  getAllCount() {
    if (!this.allCountCache$) {
      this.allCountCache$ = this.http.get<IPaginationResponse<IPlayer>>(`${environment.endpoint}/players?limit=1`).pipe(
        map(response => response.count),
        shareReplay(1)
      );
    }
    return this.allCountCache$;
  }

  search(params: any) {
    let query = '';
    Object.keys(params).forEach((key) => {
      query += query
        ? `&${key}=${params[key]}`
        : `?${key}=${params[key]}`;
    });
    return this.http.get<IPaginationResponse<IPlayer>>(`${environment.endpoint}/players/${query}`).pipe(
      map(response => response.results)
    );
  }

  getMany(ids: number[]): Observable<IPlayer[]> {
    return this.http.get<IPaginationResponse<IPlayer>>(`${environment.endpoint}/players/?ids=${ids.join(',')}`).pipe(
      map(response => response.results)
    );
  }

  getOnlinePlayersCount(): Observable<number> {
    return this.http.get<IPaginationResponse<any>>(`${environment.endpoint}/online/players?limit=1`).pipe(map(r => r.count));
  }
}
