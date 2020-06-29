import {EventOrganizer} from "@app/broadcast/core/event/event.model";
import {IDefaultEntities} from "@app/broadcast/core/models/default-entities";
import {IPaginationParams} from "@app/modules/main/model/common";
import * as moment from "moment";

export enum BroadcastType {
  FREE = 0,
  PAY = 1,
  ONLY_TICKET = 2
}

export type TTournamentPrizeCurrency = 'USD' | 'EUR';

export enum TournamentStatus {
  EXPECTED = 1,
  GOES = 2,
  COMPLETED = 3
}

export enum TournamentType {
  MATCH = 0,
  PLAYOFF = 1,
  SWISS = 2,
  CIRCULAR = 3
}

export enum TournamentResourceType {
  Tournament = 'Tournament',
  FounderTournament = 'FounderTournament',
  OnlineTournament = 'OnlineTournament',
}

export interface ILink {
  full: string;
}


export interface ITournament {
  id: number;
  title: string;
  additional_title: string;
  slug: string;
  location: string;
  datetime_of_tournament?: string;
  datetime_of_finish?: string;
  tournament_type?: TournamentType;
  broadcast_type: BroadcastType;
  event?: number;
  prize_fund: number;
  status: TournamentStatus;
  image: string | any;
  about: string; // Html content
  press: string; // Html content
  contacts: string; // Html content
  product?: string;
  organized_by: EventOrganizer; // @todo
  // TODO hard type
  resourcetype?: TournamentResourceType;
  defaults?: IDefaultEntities;
  prize_fund_currency?: TTournamentPrizeCurrency;
}

export interface ITimelineTournament extends ITournament{
  momentTime: moment.Moment
}


export interface ITournamentRequest extends IPaginationParams{
  event?: string
  status?: TournamentStatus
  broadcast_type?: BroadcastType
  current?: string
  upcoming?: string
  fide?: 'True' | 'False'
  watch_now?: 'True' | 'False'
  resourcetype?: string
  organized_by?: string
}
