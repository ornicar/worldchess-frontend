import { Component, OnInit, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromMainPage from './store/main-page.reducer';
import { MainPageGetInfo } from './store/main-page.actions';
import { PaygateEmbeddedService } from '../../paygate/paygate-embedded/paygate-embedded.service';
import { FounderTournament } from '../../broadcast/core/tournament/tournament.model';
import { Subscriptions, SubscriptionHelper } from '../../shared/helpers/subscription.helper';
import { GetUserPurchases } from '../../purchases/user-purchases/user-purchases.actions';
import { Router } from '@angular/router';


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit, OnDestroy {
  BannerType = fromMainPage.BannerType;
  banner$ = this.store$.pipe(
    select(fromMainPage.selectMainPageBanner)
  );
  subs: Subscriptions = {};

  constructor(
    private store$: Store<fromMainPage.State>,
    private paygateEmbeddedService: PaygateEmbeddedService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.subs.buyBroadcastComplete = this.paygateEmbeddedService.buyCompleted$.subscribe((ok: boolean) => {
      this.store$.dispatch(new GetUserPurchases());
    });
    this.store$.dispatch(new MainPageGetInfo());
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  onBuyBroadcast(tournament: FounderTournament) {
    this.router.navigate(['', { outlets: { p: ['paygate', 'purchase'] }}], {
      queryParams: {
        tournament: tournament.id,
      },
      state: {
        tournament: {
          price: tournament.ticket_price,
          stripeId: tournament.product,
          title: `${tournament.title} ${tournament.additional_title}`,
        },
      },
      fragment: 'tournament',
    });
  }


}
