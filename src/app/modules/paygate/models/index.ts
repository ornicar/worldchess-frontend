export interface ISpecialPlanProduct {
  name: string;
  amount: number;
  currency: string;
  old_price: number;
  interval: number;
  interval_count: number;
  stripe_id: string;
  status: number;
  created: string;
}

export interface ICard {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  name: string;
}

export interface ICouponResponse {
  id: string;
  valid: boolean;
  amountOff: number;
  percentOff: number;
}

export interface IChargeProductRequest {
  stripeToken: string;
  sku: string;
  coupon?: string;
}

export interface IChargePlanRequest {
  stripeToken: string;
  plan: string;
  coupon?: string;
}
