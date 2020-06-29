import { Component, EventEmitter, Output } from '@angular/core';
import { map } from 'rxjs/operators';
import { PaygatePopupService } from '../../../services/paygate-popup.service';
import { ISpecialPlanProduct } from '../../../models';
import { environment } from '../../../../../../environments/environment';

const PRO_PLAN = environment.pro_plan_stripe_id;

@Component({
  selector: 'wc-pro',
  templateUrl: './pro.component.html',
  styleUrls: ['./pro.component.scss'],
})
export class ProComponent {
  proPrice$ = this.paygatePopupSertvice.products$.pipe(
    map((products: ISpecialPlanProduct[]) => {
      const proProduct = products ? products.find(p => p.stripe_id === PRO_PLAN) : null;
      return proProduct ? proProduct.amount : null;
    })
  );

  showFideId$ = this.paygatePopupSertvice.showFideId$;

  @Output() mobileShowForm = new EventEmitter<boolean>();

  constructor(private paygatePopupSertvice: PaygatePopupService) {}
}
