import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { take, map } from 'rxjs/operators';
import { PlanType } from '../../../services/paygate-popup.service';

@Component({
  selector: 'wc-subscription-menu',
  templateUrl: './subscription-menu.component.html',
  styleUrls: ['./subscription-menu.component.scss']
})
export class SubscriptionMenuComponent {

  @Input()
  active: PlanType;

  @Input()
  canChange = true;

  upgrade$ = this.activatedRoute.queryParamMap.pipe(
    map(paramMap => paramMap.get('upgrade')),
  );

  showBasic$ = this.upgrade$.pipe(
    map((upgrade) => {
      return !upgrade;
    })
  );

  showPro$ = this.upgrade$.pipe(
    map((upgrade) => {
      if (!upgrade) {
        return true;
      } else {
        return upgrade === 'basic';
      }
    }),
  );

  showPremium$ = this.upgrade$.pipe(
    map((upgrade) => {
      if (!upgrade) {
        return true;
      } else {
        return upgrade === 'basic' || upgrade === 'pro';
      }
    }),
  );

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute) { }

  selectPlan(plan: PlanType) {
    this.activatedRoute.queryParams.pipe(
      take(1),
    ).subscribe((queryParams) => {
      return this.router.navigate([], { fragment: plan, queryParams });
    });
  }
}
