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
