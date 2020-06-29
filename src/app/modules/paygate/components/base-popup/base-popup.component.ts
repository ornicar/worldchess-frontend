import { Component, Input } from '@angular/core';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'wc-base-popup',
  templateUrl: './base-popup.component.html',
  styleUrls: ['./base-popup.component.scss'],
})
export class BasePopupComponent {
  @Input()
  popupTitle = 'New account';

  @Input()
  overrideProBackground = null;

  @Input() showCloseIcon = true;

  @Input() needResetTumblers = false;

  proContainer$ = combineLatest([
    this.paygatePopupService.proSelected$,
    this.paygatePopupService.fideSelected$,
  ]).pipe(
    map(([proSelected, fideSelected]) => {
      return this.overrideProBackground !== null  ? this.overrideProBackground : proSelected || fideSelected;
    }),
  );

  constructor(private paygatePopupService: PaygatePopupService) {}

  closePopup() {
    this.paygatePopupService.closePopup(this.needResetTumblers);
    window['dataLayerPush']('wchReg', 'Become a member', 'popup buttons', 'close', null, null);
  }
}
