import { HttpClient, HttpParams } from '@angular/common/http';
import { ITour, ITourWithDefaults } from './tour.model';

import { IDefaultEntities } from '../models/default-entities';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';

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

  getByTournament(id: number): Observable<ITour[]> {
    const params = new HttpParams().set('tournament', id.toString());

    return this.http.get<ITour[]>(`${environment.endpoint}/tours/`, { params })
      .pipe(
        map(i => i.sort( (a, b) => {
          if (a.tour_number < b.tour_number) { return -1; }
          if (a.tour_number > b.tour_number) { return 1; }
          return 0;
        }))
      );
  }
}
