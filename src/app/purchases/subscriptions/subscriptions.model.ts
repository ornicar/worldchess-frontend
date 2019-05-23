import { IPlan } from '../plan/plan.model';

export enum SubscriptionStatusEnum {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid'
}

export interface ISubscription {
  stripe_id: string;
  plan: IPlan;
  period: {
    upper: string;
    lower: string;
  };
  status: SubscriptionStatusEnum;
  created: string; // date
  cancel_at_period_end: boolean | null;
  is_active: boolean;
}
