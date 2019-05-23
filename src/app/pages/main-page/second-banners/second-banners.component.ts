import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {filter, map, tap} from 'rxjs/operators';
import {SubscriptionHelper, Subscriptions} from '../../../shared/helpers/subscription.helper';
import {ScreenStateService} from '../../../shared/screen/screen-state.service';
import {IMiniBanner, miniBannerType} from '../mini-banner/mini-banner.component';
import {BannerType, miniBanner, NewsBanner, RatingBanner, ShopBanner, TournamentBanner} from '../store/main-page.reducer';
import * as fromMainPage from '../store/main-page.reducer';

@Component({
  selector: 'wc-second-banners',
  templateUrl: './second-banners.component.html',
  styleUrls: ['./second-banners.component.scss']
})
export class SecondBannersComponent implements OnInit, OnDestroy {

  firstBanner$: Observable<IMiniBanner> = this.store$.pipe(
    select(fromMainPage.selectMiniPageBanner1),
    filter(banner => Boolean(banner)),
    map(banner => this.processBanner(banner))
  );

  secondBanner$: Observable<IMiniBanner> = this.store$.pipe(
    select(fromMainPage.selectMiniPageBanner2),
    filter(banner => Boolean(banner)),
    map(banner => this.processBanner(banner))
  );

  thirdBanner$: Observable<IMiniBanner> = this.store$.pipe(
    select(fromMainPage.selectMiniPageBanner3),
    filter(banner => Boolean(banner)),
    map(banner => this.processBanner(banner))
  );

  showFirst: boolean;
  showSecond: boolean;

  private subs: Subscriptions = {};

  constructor(
    private store$: Store<fromMainPage.State>,
    private cd: ChangeDetectorRef,
    private screenState: ScreenStateService
  ) {
  }

  miniBannerType = miniBannerType;

  ngOnInit() {
    this.subs.onMatchMobile = this.screenState.matchMediaMobile$
      .subscribe(matches => this.onResizeMobile(matches));

    this.subs.onMatchMobile = this.screenState.matchMediaTabletSmall$
      .subscribe(matches => this.onResizeTabletSmall(matches));
  }

  onResizeTabletSmall(matches: MediaQueryList['matches']) {
    this.showFirst = !matches;
    this.cd.markForCheck();
  }

  onResizeMobile(matches: MediaQueryList['matches']) {
    this.showSecond = !matches;
    this.cd.markForCheck();
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  private processRatingBanner(banner: RatingBanner): IMiniBanner {
    return {
      type: 'rating',
      title: `<b>No ${banner.player.rank}</b><br />${banner.player.full_name}`,
      image: banner.image,
      link: {
        label: banner.link_text,
        navigation: '/ratings'
      }
    };
  }

  private processNewsBanner(banner: NewsBanner): IMiniBanner {
    return {
      type: 'news',
      title: banner.title,
      image: banner.image,
      link: {
        label: banner.link_text,
        navigation: `/news/${banner.news_id}`
      }
    };
  }

  private processShopBanner(banner: ShopBanner): IMiniBanner {
    return {
      type: 'shop',
      title: banner.title,
      image: banner.image,
      link: {
        label: banner.link_text,
        path: banner.link_url
      }
    };
  }

  private processTournamentBanner(banner: TournamentBanner): IMiniBanner {
    return {
      type: 'event',
      title: banner.title,
      image: banner.image,
      link: {
        label: banner.link_text,
        navigation: `/tournament/${banner.tournament}`
      }
    };
  }

  private processBanner(banner: miniBanner): IMiniBanner {
    switch (banner.banner_type) {
      case BannerType.News:
        return this.processNewsBanner(banner);
      case BannerType.Rating:
        return this.processRatingBanner(banner);
      case BannerType.Shop:
        return this.processShopBanner(banner);
      case BannerType.Tournament:
        return this.processTournamentBanner(banner);
    }
  }
}
