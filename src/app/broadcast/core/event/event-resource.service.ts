import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {IEvent, IEventAndDefaults, IEventWithDefaults} from './event.model';

@Injectable()
export class EventResourceService {

  constructor(private http: HttpClient) { }

  getWithDefaults(id: number): Observable<IEventAndDefaults> {
    return this.http.get<IEventWithDefaults>(`${environment.endpoint}/events/${id}/`).pipe(
      map(event => {
        const defaults = event.defaults;

        delete event.defaults;

        return { defaults, event };
      })
    );
  }

  getWithDefaultsBySlug(slug: string): Observable<IEventAndDefaults> {
    return this.http.get<IEventWithDefaults>(`${environment.endpoint}/events/${slug}/slug/`).pipe(
      map(event => {
        const defaults = event.defaults;

        delete event.defaults;

        return { defaults, event };
      })
    );
  }

  getAll(params = {}): Observable<IEvent[]> {
    return this.http.get<IEvent[]>(`${environment.endpoint}/events/`, { params });
  }
}
