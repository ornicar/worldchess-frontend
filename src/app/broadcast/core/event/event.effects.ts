import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {EventResourceService} from './event-resource.service';
import {AddEvent, EventActionTypes, GetEvent, LoadEvents} from './event.actions';


@Injectable()
export class EventEffects {

  constructor(
    private actions$: Actions,
    private eventResource: EventResourceService) {
  }

  @Effect()
  getEvents$: Observable<Action> = this.actions$.pipe(
    ofType(EventActionTypes.GetEvents),
    switchMap(() =>
      this.eventResource
        .getAll()
        .pipe(map(events => new LoadEvents({ events })))
    )
  );

  @Effect()
  getEventsWithTournaments$: Observable<Action> = this.actions$.pipe(
    ofType(EventActionTypes.GetEventsWithTournaments),
    switchMap(() =>
    this.eventResource
      .getAll({ non_empty: true })
      .pipe(map(events => new LoadEvents({ events }))))
  );

  @Effect()
  getEvent$: Observable<Action> = this.actions$.pipe(
    ofType<GetEvent>(EventActionTypes.GetEvent),
    map((action: GetEvent) => action.payload),
    switchMap(({ id }) =>
      this.eventResource
        .getWithDefaults(id)
        .pipe(map(({event}) => new AddEvent({ event })))
    )
  );
}
