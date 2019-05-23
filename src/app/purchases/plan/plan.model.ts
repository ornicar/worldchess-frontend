export enum IntervalEnum {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year'
}
export interface IPlan {
  name: string;
  amount: number;
  currentcy: string;
  interval: IntervalEnum;
  interval_count: number;
  stripe_id: string;
  status: number;
  created: string;
}
