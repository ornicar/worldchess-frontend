import { CommonTournament } from '../../broadcast/core/tournament/tournament.model';
import { ISubscription } from '../../purchases/subscriptions/subscriptions.model';
import { IPurchasePlan } from '../../purchases/user-purchases/user-purchases.model';


export interface IOrderProduct {
  tournament: CommonTournament;
  price: number;
  currency: string;
  product: string;
  stripe_id: string;
  status: number;
  created: string;
}

export interface IOrder {
  product: IOrderProduct;
  amount: number;
  currency: string;
  status: string;
  created: string;
}

export enum FounderStatus {
  NONE = 0,
  WAIT = 1,
  APPROVE = 2,
}

export enum AccountVerification {
  NOT_VERIFIED = 0,
  ON_CHECK = 1,
  VERIFIED = 2,
}

export interface IAccountSocial {
  facebook: string;
  instagram: string;
  twitter: string;
  mates: boolean;
}

export interface IAccount {
  id: number;
  email: string;
  full_name: string;
  nickname?: string;
  admin_email?: string;
  avatar: { [key: string]: string };
  premium: boolean;
  receive_newsletters: boolean;
  subscriptions: ISubscription[];
  orders: IOrder[];
  founder_approve_status: FounderStatus;
  birth_date?: string;
  country?: number;
  is_public?: boolean;
  social_accounts?: IAccountSocial;
}

export interface IAccountRating {
  since: string;
  fide_id?: number;
  verification?: AccountVerification;
  subscriptions: IPurchasePlan[];
  worldchess_rating: number;
  worldchess_bullet: number;
  worldchess_blitz: number;
  worldchess_rapid: number;
  fide_rating?: number;
  fide_bullet?: number;
  fide_blitz?: number;
  fide_rapid?: number;
}
