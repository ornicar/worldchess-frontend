import { Component, EventEmitter, Output } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { PaygatePopupService } from '../../../services/paygate-popup.service';
import { ISpecialPlanProduct } from '../../../models';

@Component({
  selector: 'wc-with-fide',
  templateUrl: './with-fide.component.html',
  styleUrls: ['./with-fide.component.scss']
})
export class WithFideComponent {

  fideSelected$ = this.paygatePopupService.fideSelected$;

  fidePrice$ = this.paygatePopupService.products$.pipe(
    map((products: ISpecialPlanProduct[]) => {
      const fideProduct = products ? products.find(p => p.name === 'FIDE-ID') : null;
      return fideProduct ? fideProduct.amount : null;
    }),
  );

  @Output() mobileShowForm = new EventEmitter<boolean>();

  constructor(private paygatePopupService: PaygatePopupService) { }

  toggleFide() {
    const fideSelected = this.paygatePopupService.fideSelected$.getValue();
    this.paygatePopupService.fideSelected$.next(!fideSelected);
  }

}
