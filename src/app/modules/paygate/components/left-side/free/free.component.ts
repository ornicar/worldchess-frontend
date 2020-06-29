import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';

@Component({
  selector: 'wc-free',
  templateUrl: './free.component.html',
  styleUrls: ['./free.component.scss']
})
export class FreeComponent {

  @Output() mobileShowForm = new EventEmitter<boolean>();

  showFideId$ = this.paygatePopupService.showFideId$;

  constructor(private paygatePopupService: PaygatePopupService) { }

}
