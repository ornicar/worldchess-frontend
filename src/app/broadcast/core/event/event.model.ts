import {IDefaultEntities} from '../models/default-entities';

export enum EventTextKeys {
  LONDON = 'london',
}

export enum EventOrganizer {
  FIDE = 'fide',
  FOUNDER = 'users',
  ONLINE = 'other'
}

export interface IEvent {
  id: number;
  name: string;
  slug: string;
  event_date: string;
  organized_by: EventOrganizer;
}

export interface IEventWithDefaults extends IEvent {
  defaults: IDefaultEntities;
}

export interface IEventAndDefaults {
  event: IEvent;
  defaults: IDefaultEntities;
}
