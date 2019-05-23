
export interface IPurchasePlanPeriod {
  lower: string;
  upper: string;
  bounds: string;
}

export interface IPurchasePlansInfo {
  [name: string]: Array<IPurchasePlanPeriod>;
}

export interface IPurchasePlan {
  plan: string;
  period: IPurchasePlanPeriod;
}

export interface IUserPurchase {
  products: string[];
  id: number;
  plans: IPurchasePlansInfo;
  has_active_plan: boolean;
}
