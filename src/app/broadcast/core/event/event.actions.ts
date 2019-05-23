import {Update} from '@ngrx/entity';
import {Action} from '@ngrx/store';
import {IEvent} from './event.model';

export enum EventActionTypes {
  GetEvent = '[Event] Get Event',
  GetEvents = '[Event] Get Events',
  GetEventsWithTournaments = '[Event] Get Events with tournaments',
  SetSelectedEvent = '[Event] Set selected event',
  ClearSelectedEvent = '[Event] Clear selected event',
  LoadEvents = '[Event] Load Events',
  AddEvent = '[Event] Add Event',
  // UpsertEvent = '[Event] Upsert Event',
  AddEvents = '[Event] Add Events',
  // UpsertEvents = '[Event] Upsert Events',
  UpdateEvent = '[Event] Update Event',
  UpdateEvents = '[Event] Update Events',
  DeleteEvent = '[Event] Delete Event',
  DeleteEvents = '[Event] Delete Events',
  ClearEvents = '[Event] Clear Events'
}

export class GetEvent implements Action {
  readonly type = EventActionTypes.GetEvent;

  constructor(public payload: { id: number }) {}
}

export class GetEvents implements Action {
  readonly type = EventActionTypes.GetEvents;

  constructor() {}
}

export class GetEventsWithTournaments implements Action {
  readonly  type = EventActionTypes.GetEventsWithTournaments;

  constructor() {}
}

export class SetSelectedEvent implements Action {
  readonly type = EventActionTypes.SetSelectedEvent;

  constructor(public payload: { id: number }) {}
}

export class ClearSelectedEvent implements Action {
  readonly type = EventActionTypes.ClearSelectedEvent;

  constructor() {}
}

export class LoadEvents implements Action {
  readonly type = EventActionTypes.LoadEvents;

  constructor(public payload: { events: IEvent[] }) {}
}

export class AddEvent implements Action {
  readonly type = EventActionTypes.AddEvent;

  constructor(public payload: { event: IEvent }) {}
}
/*
export class UpsertEvent implements Action {
  readonly type = EventActionTypes.UpsertEvent;

  constructor(public payload: { event: Update<IEvent> }) {}
}
*/
export class AddEvents implements Action {
  readonly type = EventActionTypes.AddEvents;

  constructor(public payload: { events: IEvent[] }) {}
}
/*
export class UpsertEvents implements Action {
  readonly type = EventActionTypes.UpsertEvents;

  constructor(public payload: { events: Update<IEvent>[] }) {}
}
*/
export class UpdateEvent implements Action {
  readonly type = EventActionTypes.UpdateEvent;

  constructor(public payload: { event: Update<IEvent> }) {}
}

export class UpdateEvents implements Action {
  readonly type = EventActionTypes.UpdateEvents;

  constructor(public payload: { events: Update<IEvent>[] }) {}
}

export class DeleteEvent implements Action {
  readonly type = EventActionTypes.DeleteEvent;

  constructor(public payload: { id: number }) {}
}

export class DeleteEvents implements Action {
  readonly type = EventActionTypes.DeleteEvents;

  constructor(public payload: { ids: number[] }) {}
}

export class ClearEvents implements Action {
  readonly type = EventActionTypes.ClearEvents;
}

export type EventActions =
 GetEvent
 | GetEvents
  | GetEventsWithTournaments
 | SetSelectedEvent
 | ClearSelectedEvent
 | LoadEvents
 | AddEvent
 // | UpsertEvent
 | AddEvents
 // | UpsertEvents
 | UpdateEvent
 | UpdateEvents
 | DeleteEvent
 | DeleteEvents
 | ClearEvents;
