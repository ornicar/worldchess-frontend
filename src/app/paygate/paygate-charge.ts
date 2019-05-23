import { IPlan } from '../purchases/plan/plan.model';
import { IProduct, IProductWithExpand } from '../purchases/product/product.model';

export class PaygateCharge {

  static plans = (plan: IPlan, product: IProductWithExpand) => {
    return [
      {
        title: `Online Access to the ${product.tournament ? product.tournament.additional_title : product.stripe_id}`,
        titleModal: `Online Access to the ${product.tournament ? product.tournament.additional_title : product.stripe_id}`,
        featuresList: [
          `official HD-video`,
          `multi-camera view`,
          `top GM commentary`,
          `priority access to limited edition merchandise`
        ],
        oldPrice: null,
        price: product.price,
        id: product.stripe_id,
        type: `product`,
        images: [
          `supermen`
        ],
        btnCaption: `get my online ticket`,
        bgcolor: `bg-white`,
        // tslint:disable-next-line
        description: `One-time subscription gives you access to premium features for the event and puts you into the best seat in the house.`
      },
      {
        title: `12-month Online Pass`,
        titleModal: `12 Month Subscription (Includes the 2018 Match)`,
        featuresList: [
          `official broadcasts, multi-camera view`,
          `top GM commentary`,
          `priority access to limited edition merchandise`,
          `subscriber-only newsletter`
        ],
        // oldPrice: 35,
        price: plan.amount,
        id: plan.stripe_id,
        type: `plan`,
        images: [
          `faces`,
          `off-28`
        ],
        btnCaption: `get my 12-month pass`,
        bgcolor: `bg-gray`,
        description: `Full year of premium access to all official Championship cycle events.`
      }
    ];
  }
}
