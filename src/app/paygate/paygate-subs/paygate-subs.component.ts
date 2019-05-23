import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IProfile} from '../../auth/auth.model';
import {Plan} from '../dto/plan';

@Component({
  selector: 'app-paygate-subscriptions',
  templateUrl: './paygate-subs.component.html',
  styleUrls: ['./paygate-subs.component.scss']
})
export class PaygateSubsComponent implements OnInit {

  @Input() plans: Plan[];
  @Input() profile: IProfile;
  @Input() isAuthorized: boolean;

  @Output() selectPlan = new EventEmitter;

  constructor() { }

  ngOnInit() {
  }

  select(plan) {
    this.selectPlan.emit(plan);
  }

  buyButtonIsShow() {
    // Hide for premium.
    return !this.isAuthorized || !this.profile.premium;
  }

  priceIsShow() {
    return this.buyButtonIsShow();
  }
}
