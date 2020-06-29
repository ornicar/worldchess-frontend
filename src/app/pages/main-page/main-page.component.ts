import {
  Component,
  OnInit,
  OnDestroy,
  NgModuleFactoryLoader,
  NgModuleFactory,
  NgModuleRef,
  Injector,
  ViewChild,
  AfterViewInit, ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as fromMainPage from './store/main-page.reducer';
import { MainPageGetInfo } from './store/main-page.actions';
import { FounderTournament } from '@app/broadcast/core/tournament/tournament.model';
import { Subscriptions, SubscriptionHelper } from '@app/shared/helpers/subscription.helper';


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit, OnDestroy, AfterViewInit {
  BannerType = fromMainPage.BannerType;
  banner$ = this.store$.pipe(
    select(fromMainPage.selectMainPageBanner)
  );
  subs: Subscriptions = {};
  private newsModuleRef: NgModuleRef<any>;
  @ViewChild('newsContainer', { read: ViewContainerRef, static: true }) newsContainer;
  @ViewChild('ratingsContainer', { read: ViewContainerRef, static: true }) ratingsContainer;

  constructor(
    private store$: Store<fromMainPage.State>,
    private router: Router,
    private loader: NgModuleFactoryLoader,
    private injector: Injector,
  ) {}

  ngOnInit() {
    this.store$.dispatch(new MainPageGetInfo());
  }

  ngAfterViewInit() {
    this.loader
        .load('./modules/news/news.module#NewsModule')
        .then((moduleFactory: NgModuleFactory<any>) => {
          this.newsModuleRef = moduleFactory.create(this.injector);
          const rootComponent = this.newsModuleRef['_bootstrapComponents'].find(() => true);
          const factory = this.newsModuleRef.componentFactoryResolver.resolveComponentFactory(rootComponent);
          const componentRef = this.newsContainer.createComponent(factory);
          componentRef.instance['isNewsPage'] = false;
        });

    this.loader
        .load('./modules/rating/rating.module#RatingModule')
        .then((moduleFactory: NgModuleFactory<any>) => {
          this.newsModuleRef = moduleFactory.create(this.injector);
          const rootComponent = this.newsModuleRef['_bootstrapComponents'].find(() => true);
          this.ratingsContainer.createComponent(
            this.newsModuleRef.componentFactoryResolver.resolveComponentFactory(rootComponent)
          );
        });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
    if (this.newsModuleRef) {
      this.newsModuleRef.destroy();
    }
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
