import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {IDefaultEntities} from '../models/default-entities';
import {IMatch, IMatchWithDefaults} from './match.model';

@Injectable()
export class MatchResourceService {

  constructor(private http: HttpClient) { }

  getWithDefaults(id: number): Observable<{ match: IMatch, defaults: IDefaultEntities }> {
    return this.http.get<IMatchWithDefaults>(`${environment.endpoint}/matches/${id}/`).pipe(
      map(match => {
        const defaults = match.defaults;

        delete match.defaults;

        return { defaults, match };
      })
    );
  }

  getAll() {
    return this.http.get<IMatch[]>(`${environment.endpoint}/matches/`);
  }

  getByTour(id: number) {
    const params = new HttpParams().set('tour', id.toString());

    return this.http.get<IMatch[]>(`${environment.endpoint}/matches/`, { params });
  }
}
