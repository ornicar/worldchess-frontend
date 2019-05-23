import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { SubscriptionHelper, Subscriptions } from '../../../../../shared/helpers/subscription.helper';
import { ScreenStateService } from '../../../../../shared/screen/screen-state.service';
import { ITour } from '../../../../core/tour/tour.model';
import { Tournament } from '../../../../core/tournament/tournament.model';

@Component({
  selector: 'wc-multiboard-link',
  templateUrl: './multiboard-link.component.html',
  styleUrls: ['./multiboard-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiboardLinkComponent implements OnInit, OnDestroy {

  @Input()
  tournament: Tournament;

  @Input()
  tourId: ITour['id'];

  @HostBinding('class.show-tooltip')
  private isNotMobile: boolean;

  private subs: Subscriptions = {};

  constructor(
    private cd: ChangeDetectorRef,
    private screenState: ScreenStateService
  ) {
  }

  ngOnInit() {
    this.subs.onMatchMobile = this.screenState.matchMediaMobile$
      .subscribe(matches => {
        this.isNotMobile = !matches;
        this.cd.markForCheck();
      });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }
}
