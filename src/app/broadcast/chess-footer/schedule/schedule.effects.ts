import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ScheduleResourceService } from './schedule-resource.service';
import { GetSchedules, LoadSchedules, ScheduleActionTypes, GetSchedulesByTournamentId } from './schedule.actions';


@Injectable()
export class ScheduleEffects {

  constructor(
    private actions$: Actions,
    private scheduleResource: ScheduleResourceService) { }

  @Effect()
  getSchedules$: Observable<Action> = this.actions$.pipe(
    ofType<GetSchedules>(ScheduleActionTypes.GetSchedules),
    switchMap(() => this.scheduleResource
      .getAll()
      .pipe(map(schedules => new LoadSchedules({ schedules })))
    )
  );

  @Effect()
  getSchedulesByTournamentId$: Observable<Action> = this.actions$.pipe(
    ofType<GetSchedulesByTournamentId>(ScheduleActionTypes.GetSchedulesByTournamentId),
    switchMap(action => this.scheduleResource
      .getByTournamentId(action.payload.id)
      .pipe(map(schedules => new LoadSchedules({ schedules })))
    )
  );
}
