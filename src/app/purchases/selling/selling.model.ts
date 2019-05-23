import { IPlan } from '../plan/plan.model';
import { IProduct, IProductWithExpand } from '../product/product.model';

export interface ISelling extends IMainSelling, IPaygateSelling, IPersonalSelling{
  sub_notification: number;
}

export interface IMainSelling {
  main_plan: IPlan;
  main_product: IProductWithExpand;
}

export interface IPaygateSelling {
  paygate_plan: IPlan;
  paygate_product: IProductWithExpand;
}

export interface IPersonalSelling {
  personal_plan: IPlan;
  personal_product: IProductWithExpand;
}
