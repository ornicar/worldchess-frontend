import {EventOrganizer} from '../event/event.model';
import {IDefaultEntities} from '../models/default-entities';

export enum TournamentStatus {
  EXPECTED = 1,
  GOES = 2,
  COMPLETED = 3
}

export enum TournamentState {
  TBD = 0,
  Webcast = 1,
  Live = 2,
  Start = 3
}

export enum BroadcastType {
  FREE = 0,
  PAY = 1,
  ONLY_TICKET = 2
}

export enum ApprovalStatus {
  APPROVED = 2,
  NOT_APPROVED = 0,
  REQUESTED = 1,
}

export enum TournamentResourceType {
  Tournament = 'Tournament',
  FounderTournament = 'FounderTournament',
  OnlineTournament = 'OnlineTournament',
}

export enum TournamentType {
  MATCH = 0,
  PLAYOFF = 1,
  SWISS = 2,
  CIRCULAR = 3
}

export interface TournamentWishListEntry {
  id: number;
  tournament: number;
}

export interface IGetTournamentsOptions {
  event?: number;
  fide?: 'True' | 'False';
  resourcetype?: TournamentResourceType;
  watch_now?: 'True' | 'False';
}

// TODO вынести отдельный интерфейс на игрока, его надо изолировать от команды
interface ITeamPlayerSerialization {
  fide_id: number;
  full_name: string;
  birth_year: number;
  rank: string;
  rating: number;
  avatar: string;
  federation: number;
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

export type TTournamentPrizeCurrency = 'USD' | 'EUR';

export class Tournament implements ITournament {
  id: number;
  title: string;
  additional_title: string;
  slug: string;
  location: string;
  datetime_of_tournament?: string;
  datetime_of_finish?: string;
  tournament_type?: TournamentType;
  broadcast_type: BroadcastType;
  status: TournamentStatus;
  image: string | any;
  about: string;
  press: string;
  contacts: string;
  product?: string;
  organized_by: EventOrganizer;
  resourcetype?: TournamentResourceType;
  prize_fund: number;
  event?: number;
  defaults?: IDefaultEntities;
  prize_fund_currency?: TTournamentPrizeCurrency;

  get isOnline(): boolean {
    return this.resourcetype !== undefined && this.resourcetype === TournamentResourceType.OnlineTournament;
  }

  get isFounder(): boolean {
    return this.resourcetype !== undefined && this.resourcetype === TournamentResourceType.FounderTournament;
  }

  get isCircular(): boolean {
    return this.tournament_type !== undefined && this.tournament_type === TournamentType.CIRCULAR;
  }

  get isSwiss(): boolean {
    return this.tournament_type !== undefined && this.tournament_type === TournamentType.SWISS;
  }

  get isMatch(): boolean {
    return this.tournament_type !== undefined && this.tournament_type === TournamentType.MATCH;
  }

  get isPlayoff(): boolean {
    return this.tournament_type !== undefined && this.tournament_type === TournamentType.PLAYOFF;
  }

  get isLive(): boolean {
    return this.status === TournamentStatus.GOES;
  }

  get isFree(): boolean {
    return this.broadcast_type === BroadcastType.FREE;
  }
}

export class OnlineTournament extends Tournament {
  event: number;
  players_amount: number;
  signup_datetime: {
    lower: string;
    upper: string;
  };
  move_time_limit: number;
  user_signed: boolean;
  available: boolean;
}

export class FounderTournament extends Tournament {
  approve_status: ApprovalStatus;
  founder: number;
  country: number;
  city: string;
  main_referee: string;
  tournament_director: string;
  rules: string;
  ticket_price: number;
  players: ITeamPlayerSerialization[];
  results: string;
}

export type CommonTournament = Tournament | OnlineTournament | FounderTournament;
