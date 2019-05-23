import { Tournament } from '../../broadcast/core/tournament/tournament.model';

type StatusEnum = 1 | 2;  // TODO make readable status

export interface IProduct {
  tournament: number;
  price: number;
  product: string;
  currency: string;
  stripe_id: string;
  status: StatusEnum;
  created: string;
}

export interface IProductWithExpand {
  tournament: Tournament;
  price: number;
  product: string;
  currency: string;
  stripe_id: string;
  status: StatusEnum;
  created: string;
}
