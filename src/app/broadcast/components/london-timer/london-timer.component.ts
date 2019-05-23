import {Component} from '@angular/core';
import {Plan} from '../../../paygate/dto/plan';

@Component({
  selector: 'wc-london-timer',
  templateUrl: './london-timer.component.html',
  styleUrls: ['./london-timer.component.scss']
})
export class LondonTimerComponent {

  readonly countDownDate = Date.parse('2018-11-09T15:00:00.000+00:00');

  selectedPlan: Plan = {
    id: 'london20',
    type: 'product',
    price: 20
  };

  constructor() {
  }

}
