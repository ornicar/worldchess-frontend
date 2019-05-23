import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IPlan } from '../../purchases/plan/plan.model';
import { PlanType } from '../choose-plan/choose-plan.component';


@Component({
  selector: 'wc-selected-plan',
  templateUrl: './selected-plan.component.html',
  styleUrls: ['./selected-plan.component.scss']
})
export class SelectedPlanComponent {
  @Input() title: string = null;
  @Input() price: number = null;
  @Input() planType: PlanType = PlanType.BASIC;
  @Input() showChange = true;
  @Input() isPlan = true;

  @Output() changePlan = new EventEmitter();

  PlanType = PlanType;

  get planTitle(): string {
    if (this.title) {
      return this.title;
    }
    
    switch(this.planType) {
      case PlanType.BASIC:
        return 'Free Plan';
      case PlanType.PRO:
        return 'Subscriber Plan';
    }
  }

  get planClass(): string {
    switch(this.planType) {
      case PlanType.BASIC:
        return 'basic';
      case PlanType.PRO:
        return 'pro';
    }
  }

  onChangePlanClick() {
    this.changePlan.emit();
  }
}