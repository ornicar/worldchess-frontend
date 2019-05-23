import {Injectable} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {pluck, switchMap, take, tap} from 'rxjs/operators';
import {IDefaultEntities} from '../models/default-entities';
import {EventResourceService} from './event-resource.service';
import {AddEvent} from './event.actions';
import {IEvent} from './event.model';
import * as fromEvent from './event.reducer';

@Injectable()
export class EventLoadService {

  constructor(
    private store$: Store<fromEvent.State>,
    private eventResource: EventResourceService) { }

  private loadWithSave(id: number) {
    return this.eventResource.getWithDefaults(id).pipe(
      tap(({defaults, event}) => {
        this.store$.dispatch(new AddEvent({ event }));
      })
    );
  }

  /**
   * Load from store or server.
   */
  getWhenLacking(id: number): Observable<IEvent> {
    return this.store$.pipe(
      select(fromEvent.selectEntities),
      take(1),
      switchMap(entities => entities[id]
        ? of(entities[id])
        : this.loadWithSave(id).pipe(pluck('event'))
      )
    );
  }

  getDefaults(id: number): Observable<IDefaultEntities> {
    return this.loadWithSave(id).pipe(
      pluck('defaults')
    );
  }
}
