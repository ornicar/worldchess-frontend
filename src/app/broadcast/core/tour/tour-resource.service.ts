import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {IDefaultEntities} from '../models/default-entities';
import {ITour, ITourWithDefaults} from './tour.model';

@Injectable()
export class TourResourceService {

  constructor(private http: HttpClient) { }

  getWithDefaults(id: number): Observable<{ tour: ITour, defaults: IDefaultEntities }> {
    return this.http.get<ITourWithDefaults>(`${environment.endpoint}/tours/${id}/`).pipe(
      map(tour => {
        const defaults = tour.defaults;

        delete tour.defaults;

        return { defaults, tour };
      })
    );
  }

  getAll() {
    return this.http.get<ITour[]>(`${environment.endpoint}/tours/`);
  }

  getByTournament(id: number) {
    const params = new HttpParams().set('tournament', id.toString());

    return this.http.get<ITour[]>(`${environment.endpoint}/tours/`, { params });
  }
}
