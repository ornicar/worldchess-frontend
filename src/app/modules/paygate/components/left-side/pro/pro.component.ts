import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { map } from 'rxjs/operators';
import { PaygatePopupService } from '../../../services/paygate-popup.service';
import { ISpecialPlanProduct } from '../../../models';
import { Observable } from 'rxjs';
import { ISubscription } from '@app/purchases/subscriptions/subscriptions.model';
import { Store, select } from '@ngrx/store';
import * as fromSubscription from '../../../../../purchases/subscriptions/subscriptions.reducer';

@Component({
  selector: 'wc-pro',
  templateUrl: './pro.component.html',
  styleUrls: ['./pro.component.scss'],
})
export class ProComponent {
  proPrice$ = this.paygatePopupSertvice.products$.pipe(
    map((products: ISpecialPlanProduct[]) => {
      const proProduct = products ? products.find(p => p.name === 'PRO') : null;
      return proProduct ? proProduct.amount : null;
    })
  );

  @Output() mobileShowForm = new EventEmitter<boolean>();

  constructor(private paygatePopupSertvice: PaygatePopupService) {}
}
