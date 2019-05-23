import { Component } from '@angular/core';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';


@Component({
  selector: 'wc-tournament-purchase',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.scss']
})
export class TournamentPurchaseComponent {
  product$ = this.paygatePopupService.tournamentProduct$;

  constructor(private paygatePopupService: PaygatePopupService) {}
}
