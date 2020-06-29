import {Component, OnInit, Type} from '@angular/core';
import {PinnedNewsService} from "@app/modules/main/service/pinned-news.service";
import {BehaviorSubject, combineLatest, Observable, of} from "rxjs";
import {HolderItem} from "@app/modules/main/components/main-page/holder-item";
import {NewsServiceService} from "@app/modules/main/service/news-service.service";
import {MainPageNewsCaptionItemComponent} from "@app/modules/main/components/main-page/main-page-header/main-page-news-caption-item/main-page-news-caption-item.component";
import {delayWhen, filter, first, skip} from "rxjs/operators";
import {NewsShort} from "@app/modules/main/model/news-short";
import {MainPageNewsBarComponent} from "@app/modules/main/components/main-page/main-page-header/main-page-news-bar/main-page-news-bar.component";
import {OfflineTournamentBlockComponent} from "@app/modules/app-common/components/offline-tournament-timeline-block/offline-tournament-block/offline-tournament-block.component";
import {ITournament, TournamentResourceType} from "@app/modules/main/model/tournament";
import {MainPageLegaliseYourSkillsComponent} from "@app/modules/main/components/main-page/main-page-legalise-your-skills/main-page-legalise-your-skills.component";
import {Banner, BannerOrientation} from "@app/modules/main/model/banner";
import {BannerService} from "@app/modules/main/service/banner.service";
import {MainBannerComponent} from "@app/modules/main/components/banners/main-banner/main-banner.component";
import {MainPageNewsBlockComponent} from "@app/modules/main/components/main-page/main-page-news/main-page-news-block/main-page-news-block.component";
import {News} from "@app/modules/main/model/news";
import {ImageBannerComponent} from "@app/modules/main/components/banners/image-banner/image-banner.component";
import {HorizontalImageBannerComponent} from "@app/modules/main/components/banners/horizontal-image-banner/horizontal-image-banner.component";
import {MainPageSingleGameComponent} from "@app/modules/main/components/main-page/main-page-single-game/main-page-single-game.component";
import {MainPageBecomeMemberComponent} from "@app/modules/main/components/main-page/main-page-become-member/main-page-become-member.component";
import {TournamentService} from "@app/modules/app-common/services/tournament.service";
import * as moment from "moment";
import {Moment} from "moment";
import {IOnlineTournament} from "@app/modules/game/tournaments/models/tournament.model";
import {OfflineTournamentService} from "@app/modules/app-common/services/offline-tournament.service";
import {MainPageJoinTournamentsComponent} from "@app/modules/main/components/main-page/main-page-join-tournaments/main-page-join-tournaments.component";
import {Partner} from "@app/modules/main/model/partner";
import {PartnerService} from "@app/modules/main/service/partner.service";
import {MainPagePartnersComponent} from "@app/modules/main/components/main-page/main-page-partners/main-page-partners.component";
import {PlayerRatingResourceService} from "@app/modules/app-common/services/player-rating-resource.service";
import {IPlayerCompetitors} from "@app/modules/app-common/services/player-rating.model";
import {MainPageOnlineChampionsComponent} from "@app/modules/main/components/main-page/main-page-online-champions/main-page-online-champions.component";
import {MainPageQuickGameComponent} from "@app/modules/main/components/main-page/main-page-quick-game/main-page-quick-game.component";
import {MainPageTournamentsTodayComponent} from "@app/modules/main/components/main-page/main-page-tournaments-today/main-page-tournaments-today.component";
import {MainPagePinnedNewsComponent} from "@app/modules/main/components/main-page/main-page-pinned-news/main-page-pinned-news.component";
import {TournamentStatus} from "@app/broadcast/core/tournament/tournament.model";
import {ShopBanner} from "@app/modules/main/model/shop-banner";
import {ShopBannerComponent} from "@app/modules/main/components/banners/shop-banner/shop-banner.component";
import {FullShopBannerComponent} from "@app/modules/main/components/banners/full-shop-banner/full-shop-banner.component";


interface Variant {
  components: Type<any>[],
  props?: any
}

interface ComponentUsageCondition {
  dependsOn: Observable<boolean>[],
  canBeApplied: () => boolean
  getData: () => any
}

@Component({
  selector: 'wc-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  mapDependencies = new Map<Type<any>, ComponentUsageCondition>();

  private static HalfBlockVariants = [OfflineTournamentBlockComponent, MainPageLegaliseYourSkillsComponent, ImageBannerComponent, MainPageSingleGameComponent, MainPageBecomeMemberComponent, MainPageJoinTournamentsComponent, MainPageOnlineChampionsComponent, MainPageQuickGameComponent, MainPageTournamentsTodayComponent, MainPagePinnedNewsComponent, ShopBannerComponent];
  private static FullBlockVariants = [HorizontalImageBannerComponent, MainPageSingleGameComponent, MainPageJoinTournamentsComponent, MainPagePinnedNewsComponent, FullShopBannerComponent];
  private static DelimiterVariants = [MainPagePartnersComponent];

  rowVariants: Variant[] = [
    {components: [MainPageNewsCaptionItemComponent]}, //0
    {components: [MainPageNewsBarComponent]},         //1
    {components: [MainBannerComponent]},              //2
    {components: [MainPageNewsBlockComponent]},       //3

    {components: MainPageComponent.HalfBlockVariants}, //4
    {components: MainPageComponent.HalfBlockVariants}, //5
    {components: MainPageComponent.FullBlockVariants}, //6
    {components: MainPageComponent.HalfBlockVariants}, //7
    {components: MainPageComponent.HalfBlockVariants}, //8

    {components: MainPageComponent.DelimiterVariants},  //9

    {components: MainPageComponent.HalfBlockVariants},  //10
    {components: MainPageComponent.HalfBlockVariants},  //11
    {components: MainPageComponent.FullBlockVariants},  //12
    {components: MainPageComponent.HalfBlockVariants},  //13
    {components: MainPageComponent.HalfBlockVariants},  //14

    {components: MainPageComponent.HalfBlockVariants},  //15
    {components: MainPageComponent.HalfBlockVariants},  //16
    {components: MainPageComponent.FullBlockVariants},  //17
    {components: MainPageComponent.HalfBlockVariants},  //18
    {components: MainPageComponent.HalfBlockVariants},  //19

    {components: MainPageComponent.HalfBlockVariants},  //20
    {components: MainPageComponent.HalfBlockVariants},  //21
    {components: MainPageComponent.FullBlockVariants},  //22
    {components: MainPageComponent.HalfBlockVariants},  //23
    {components: MainPageComponent.HalfBlockVariants},  //24
  ];

  items$: BehaviorSubject<HolderItem[]> = new BehaviorSubject<HolderItem[]>(new Array(this.rowVariants.length));

  newsHeaderLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  getHeaderNews: NewsShort[] = [];

  barNewsLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  barNews: News[] = [];

  pinnedNews: News[] = [];
  usedPinnedNews: News[] = [];

  tournamentsLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  tournaments: ITournament[] = [];


  onlineTournamentFromDates = moment().utcOffset(0).add(-1, 'day').format('MM/DD/YYYY HH:mm:ss');
  onlineTournamentToDates = moment().utcOffset(0).add(1, 'month').format('MM/DD/YYYY HH:mm:ss');
  onlineTournamentsLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  onlineTournaments: IOnlineTournament[] = [];

  onlineTournamentTodayFromDates = moment().utcOffset(0).startOf("day").format('MM/DD/YYYY HH:mm:ss');
  onlineTournamentTodayToDates = moment().utcOffset(0).endOf("day").format('MM/DD/YYYY HH:mm:ss');
  onlineTournamentsTodayLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  onlineTournamentsToday: IOnlineTournament[] = [];


  bannersLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  banners: Map<string, Banner> = new Map<string, Banner>();

  miniBanners: Banner[] = [];
  shopBanners: ShopBanner[] = [];
  usedShopBanners: ShopBanner[] = [];

  usedMiniBanners: Banner[] = [];

  partnersLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  partners: Partner[] = [];

  topPlayers: IPlayerCompetitors[] = [];
  topPlayersLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  loadedRows: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  usedComponents = new Set<Type<any>>();

  constructor(private newsService: NewsServiceService,
              private pinnedNewsSerivce: PinnedNewsService,
              private offlineTournamentService: OfflineTournamentService,
              private bannerService: BannerService,
              private tournamentService: TournamentService,
              private partnerService: PartnerService,
              private playerRatingResourceService: PlayerRatingResourceService
  ) {
    this.mapDependencies.set(MainPageNewsCaptionItemComponent, {
      dependsOn: [this.newsHeaderLoaded$],
      canBeApplied: () => true,
      getData: () => this.getHeaderNews[0]
    });
    this.mapDependencies.set(MainPageNewsBarComponent, {
      dependsOn: [this.barNewsLoaded$],
      canBeApplied: () => true,
      getData: () => this.barNews
    });
    this.mapDependencies.set(OfflineTournamentBlockComponent, {
      dependsOn: [this.tournamentsLoaded$],
      canBeApplied: () => !this.usedComponents.has(OfflineTournamentBlockComponent),
      getData: () => this.tournaments
    });
    this.mapDependencies.set(MainPageLegaliseYourSkillsComponent, {
      dependsOn: [],
      canBeApplied: () => !this.usedComponents.has(MainPageLegaliseYourSkillsComponent),
      getData: () => undefined
    });
    this.mapDependencies.set(MainBannerComponent, {
      dependsOn: [this.bannersLoaded$],
      canBeApplied: () => true,
      getData: () => this.banners.get("main_banner")
    });
    this.mapDependencies.set(MainPageNewsBlockComponent, {
      dependsOn: [this.barNewsLoaded$],
      canBeApplied: () => true,
      getData: () => this.barNews
    });
    this.mapDependencies.set(ImageBannerComponent, {
      dependsOn: [this.bannersLoaded$],
      canBeApplied: () => {
        const banner = this.banners.get("image_banner");
        return banner && banner.image_orientation === BannerOrientation.portrait && !this.usedComponents.has(ImageBannerComponent)
      },
      getData: () => this.banners.get("image_banner")
    });
    this.mapDependencies.set(HorizontalImageBannerComponent, {
      dependsOn: [this.bannersLoaded$],
      canBeApplied: () => {
        const banner = this.banners.get("image_banner");
        return banner && banner.image_orientation === BannerOrientation.landScape && !this.usedComponents.has(HorizontalImageBannerComponent)
      },
      getData: () => this.banners.get("image_banner")
    });
    this.mapDependencies.set(MainPageSingleGameComponent, {
      dependsOn: [],
      canBeApplied: () => !this.usedComponents.has(MainPageSingleGameComponent),
      getData: () => {
      }
    });
    this.mapDependencies.set(MainPageBecomeMemberComponent, {
      dependsOn: [],
      canBeApplied: () => !this.usedComponents.has(MainPageBecomeMemberComponent),
      getData: () => {
      }
    });
    this.mapDependencies.set(MainPageJoinTournamentsComponent, {
      dependsOn: [this.onlineTournamentsLoaded$],
      canBeApplied: () => !this.usedComponents.has(MainPageJoinTournamentsComponent) && this.onlineTournaments.length>0,
      getData: () => this.onlineTournaments,
    });
    this.mapDependencies.set(MainPageTournamentsTodayComponent, {
      dependsOn: [this.onlineTournamentsTodayLoaded$],
      canBeApplied: () => !this.usedComponents.has(MainPageTournamentsTodayComponent) && this.onlineTournamentsToday.length>0,
      getData: () => this.onlineTournamentsToday
    });
    this.mapDependencies.set(MainPagePartnersComponent, {
      dependsOn: [this.partnersLoaded$],
      canBeApplied: () => !this.usedComponents.has(MainPagePartnersComponent),
      getData: () => this.partners
    });
    this.mapDependencies.set(MainPageOnlineChampionsComponent, {
      dependsOn: [this.topPlayersLoaded$],
      canBeApplied: () => !this.usedComponents.has(MainPageOnlineChampionsComponent),
      getData: () => this.topPlayers
    });
    this.mapDependencies.set(MainPageQuickGameComponent, {
      dependsOn: [],
      canBeApplied: () => !this.usedComponents.has(MainPageQuickGameComponent),
      getData: () => {
      }
    });
    this.mapDependencies.set(MainPagePinnedNewsComponent, {
      dependsOn: [this.bannersLoaded$],
      canBeApplied: () => {
        if (this.miniBanners.length > 0) {
          const miniBanner = this.miniBanners.pop();
          this.usedPinnedNews.push({
            id: miniBanner.news_id,
            title: miniBanner.title,
            preview: miniBanner.preview,
            content: '',
            featured_image: miniBanner.image && (miniBanner.image.full || miniBanner.image.medium) || '',
            video_link: miniBanner.video,
            pub_date: miniBanner.pub_datetime && moment(miniBanner.pub_datetime) || moment(0),
            slug: miniBanner.slug,
          } as News)
          return true;
        }
        return false;
      },
      getData: () => this.usedPinnedNews.pop()
    });
    this.mapDependencies.set(ShopBannerComponent, {
      dependsOn: [this.bannersLoaded$],
      canBeApplied: () =>{
        if (this.usedComponents.has(ShopBannerComponent) || this.shopBanners.length===0){
          return false;
        }
        this.usedShopBanners.push(this.shopBanners.pop());
        return true;
      },
      getData: ()=>this.usedShopBanners.pop(),
    });
    this.mapDependencies.set(FullShopBannerComponent, {
      dependsOn: [this.bannersLoaded$],
      canBeApplied: () =>{
        if (this.usedComponents.has(FullShopBannerComponent) || this.shopBanners.length===0){
          return false;
        }
        this.usedShopBanners.push(this.shopBanners.pop());
        return true;
      },
      getData: ()=>this.usedShopBanners.pop(),
    })
  }

  onlineTournamentTodayComparator(now: Moment) {
    return (t1: IOnlineTournament, t2: IOnlineTournament) => {
      if (t1.status !== t2.status) {
        return t1.status - t2.status;
      }
      const  diff1 = Math.abs(moment(t1.datetime_of_tournament).diff(now, "ms"));
      const diff2 = Math.abs(moment(t1.datetime_of_tournament).diff(now, "ms"));
      return diff1-diff2;
    }
  }

  ngOnInit() {
    this.startLoadingData();
    this.startComposingLayout();
  }

  private startLoadingData() {
    this.newsService.getHeaderNews().subscribe(val => {
      this.getHeaderNews = [val];
      this.newsHeaderLoaded$.next(true);
    });
    this.newsService.getLastNews(30).subscribe(val => {
      this.barNews = [...val];
      this.pinnedNews = this.shuffleArray([...val]);
      this.barNewsLoaded$.next(true);
    });
    this.offlineTournamentService.findTournaments({resourcetype: TournamentResourceType.Tournament}).subscribe(
      val => {
        this.tournaments = val.results || [];
        this.tournamentsLoaded$.next(true);
      }
    );
    this.bannerService.getBanners().subscribe(
      val => {
        this.banners = val;
        const miniBanners = [];
        const shopBanners=[];
        for (let entry of val) {
          if (entry[0].startsWith("mini_banner")) {
            miniBanners.push(entry[1]);
          }
          if (entry[0].startsWith("shop_banner")) {
            shopBanners.push(entry[1]);
          }
        }
        this.miniBanners = miniBanners;
        this.shopBanners = shopBanners;
        this.bannersLoaded$.next(true);
      }
    );
    this.tournamentService.getOnlineTournaments(this.onlineTournamentFromDates, this.onlineTournamentToDates, undefined, undefined, undefined, "asc", "status")
      .subscribe(data => {
        this.onlineTournaments = (data || [])
          .filter(t=>[TournamentStatus.EXPECTED, TournamentStatus.GOES].indexOf(t.status)>=0)
          .sort(this.onlineTournamentTodayComparator(moment(Date.now())));
        this.onlineTournamentsLoaded$.next(true);
      });
    this.tournamentService.getOnlineTournaments(this.onlineTournamentTodayFromDates, this.onlineTournamentTodayToDates, undefined, undefined, 30, "asc", "status")
      .subscribe(data => {
        this.onlineTournamentsToday = (data || [])
          .filter(t=>[TournamentStatus.EXPECTED, TournamentStatus.GOES].indexOf(t.status)>=0)
          .sort(this.onlineTournamentTodayComparator(moment(Date.now())));
        this.onlineTournamentsTodayLoaded$.next(true);
      });
    this.partnerService.findPartners().subscribe(
      val => {
        this.partners = val;
        this.partnersLoaded$.next(true);
      }
    );
    this.playerRatingResourceService.getBest10Players('worldchess').subscribe(val => {
      this.topPlayers = val;
      this.topPlayersLoaded$.next(true);
    });
  }

  private startComposingLayout() {
    for (let i = this.rowVariants.length - 1; i >= 0; i--) {
      this.loadedRows.pipe(skip(i)).pipe(first()).subscribe(val => {
        if (this.rowVariants[i].components.length === 0) {
          this.loadedRows.next(this.rowVariants.length - i);
          return;
        }
        const shuffled = this.shuffleArray([...this.rowVariants[i].components]);
        const dependencyMap = new Map<Type<any>, Observable<boolean>[]>();
        let prevDependency = [];
        shuffled.forEach(item => {
          const key = item;
          prevDependency = [...prevDependency, ...this.mapDependencies.get(item).dependsOn];
          dependencyMap.set(key, prevDependency)
        });

        of(...shuffled)
          .pipe(delayWhen(val => this.dependenciesAreReady(dependencyMap.get(val))))
          .pipe(filter(val => this.mapDependencies.get(val).canBeApplied()))
          .pipe(first())
          .subscribe(val => {
            const items = [...(this.items$.value)];
            items[i] = {
              component: val,
              data: this.mapDependencies.get(val).getData(),
              props: {...(this.rowVariants[i].props || {})},
            };
            this.usedComponents.add(val)
            items.push();
            this.items$.next(items);
            this.loadedRows.next(this.rowVariants.length - i);
          })
      })
    }
  }

  shuffleArray<T>(array: T[]) {
    return array.sort(() => Math.random() - 0.5);
  }

  dependenciesAreReady(dependencies: Observable<any>[]) {
    if (dependencies.length === 0) {
      return of(true);
    }
    return combineLatest(dependencies).pipe(first(val => val.length == 0 || val.every(i => !!i)));
  }
}
