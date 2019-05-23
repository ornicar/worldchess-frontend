import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ISchedule } from './schedule.model';

export enum ScheduleActionTypes {
  GetSchedules = '[Schedule] Get Schedules',
  LoadSchedules = '[Schedule] Load Schedules',
  GetSchedulesByTournamentId = '[Schedule] Get Schedule By Tournament Id',
}

export class LoadSchedules implements Action {
  readonly type = ScheduleActionTypes.LoadSchedules;

  constructor(public payload: { schedules: ISchedule[] }) {}
}

export class GetSchedules implements Action {
  readonly type = ScheduleActionTypes.GetSchedules;

  constructor() {}
}

export class GetSchedulesByTournamentId implements Action {
  readonly type = ScheduleActionTypes.GetSchedulesByTournamentId;

  constructor(public payload: { id: number }) {}
}

export type ScheduleActions =
 LoadSchedules | GetSchedules | GetSchedulesByTournamentId;
