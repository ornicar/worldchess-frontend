import { Component, EventEmitter, Output, Input, OnChanges, OnDestroy, ViewChild, ElementRef }  from '@angular/core';
import { Store, select } from '@ngrx/store';
import { map } from 'rxjs/operators';
import * as fromSelling from '../../purchases/selling/selling.reducer';
import * as fromRoot from '../../reducers';
import { IPlan } from '../../purchases/plan/plan.model';
import { BehaviorSubject } from 'rxjs';
import { SubscriptionHelper, Subscriptions } from '../../shared/helpers/subscription.helper';


export enum PlanType {
  BASIC = 1,
  PRO = 2,
  PREMIUM = 3,
}

enum PlanAdvantagesType {
  LEFT,
  RIGHT,
  FULL
}

@Component({
  selector: 'wc-choose-plan',
  templateUrl: './choose-plan.component.html',
  styleUrls: ['./choose-plan.component.scss']
})
export class ChoosePlanComponent implements OnChanges, OnDestroy {
  @Input() choosePlan: BehaviorSubject<any>;
  @Input() showPresentation = true;
  private subs: Subscriptions = {};

  PlanType = PlanType;
  PlanAdvantagesType = PlanAdvantagesType;

  selectedPresentationPlan = PlanType.BASIC;

  @ViewChild('choosePlan') choosePlanEl: ElementRef;

  _selectedPlan: { plan: IPlan, type: PlanType } = { plan: null, type: PlanType.BASIC };
  @Output() selectedPlan = new EventEmitter();

  presentationPlanAdvantages = {
    [PlanType.BASIC]: [
        'Free forever',
        'Watch open events and streams of top events',
        'Chat with friends and experts during games',
        'Your official chess profile on Worldchess.com',
        'Organize your own broadcasts and streams',
        'Ability to charge for your online events',
        'Soon: Play chess on official platform'
    ],
    [PlanType.PRO]: [
        'All free features plus...',
        'Access to all premium events broadcasts',
        'Verified Official profile on Worldchess.com',
        'Premium chat status and features',
        'Priority access to all World Chess events',
        'Priority access to official merchandise',
        'Opportunity to ask questions during press conferences',
        'Soon: Play chess on official platform',
    ],
  };

  mainPlan$ = this.store$.pipe(
    select(fromSelling.selectMainSelling),
    map(selling => selling ? selling.main_plan : null)
  );

  constructor(private store$: Store<fromRoot.State>) {}

  ngOnChanges() {
    if (!!this.choosePlan && !this.subs['choosePlan']) {
      this.subs['choosePlan'] = this.choosePlan.subscribe(() => {
        if (this.choosePlanEl) {
          this.choosePlanEl.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  selectPresentationPlan(e: MouseEvent, plan: PlanType) {
    e.preventDefault();
    this.selectedPresentationPlan = plan;
    return false;
  }

  get presentationPlanClass(): string {
    switch(this.selectedPresentationPlan) {
      case PlanType.BASIC: {
        return 'basic';
      }
      case PlanType.PRO: {
        return 'pro';
      }
    }
  }

  getPresentationPlanAdvantages(plan: PlanType = this.selectedPresentationPlan) {
    return this.presentationPlanAdvantages[plan];
  }

  selectPlan(plan: IPlan, type: PlanType) {
    this._selectedPlan = { plan, type };
    this.selectedPlan.emit(this._selectedPlan);
  }
}
