import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MainPageComponent} from './components/main-page/main-page.component';
import {MainRoutingModule} from "@app/modules/main/main-routing.module";
import {AppCommonModule} from "@app/modules/app-common/app-common.module";
import {MainPageHeaderComponent} from './components/main-page/main-page-header/main-page-header.component';
import {SvgModule} from "@app/modules/svg/svg.module";
import {MainPageNewsCaptionItemComponent} from './components/main-page/main-page-header/main-page-news-caption-item/main-page-news-caption-item.component';
import {NewsServiceService} from "@app/modules/main/service/news-service.service";
import {MainPageNewsBarComponent} from './components/main-page/main-page-header/main-page-news-bar/main-page-news-bar.component';
import {MainPageNewsBarItemComponent} from './components/main-page/main-page-header/main-page-news-bar/main-page-news-bar-item/main-page-news-bar-item.component';
import {MainPageNewsComponent} from './components/main-page/main-page-news/main-page-news.component';
import {MainPageNewsItemComponent} from "@app/modules/main/components/main-page/main-page-news/main-page-news-item/main-page-news-item.component";
import {OfflineTournamentTimelineComponent} from '../app-common/components/offline-tournament-timeline-block/offline-tournament-timeline/offline-tournament-timeline.component';
import {OfflineTournamentTimelineCardComponent} from '../app-common/components/offline-tournament-timeline-block/offline-tournament-timeline-card/offline-tournament-timeline-card.component';
import {OfflineTournamentBlockComponent} from '../app-common/components/offline-tournament-timeline-block/offline-tournament-block/offline-tournament-block.component';
import {SharedModule} from "@app/shared/shared.module";
import {MainPageLegaliseYourSkillsComponent} from './components/main-page/main-page-legalise-your-skills/main-page-legalise-your-skills.component';
import {MainPageBecomeMemberComponent} from './components/main-page/main-page-become-member/main-page-become-member.component';
import {MainPageOnlineChampionsComponent} from './components/main-page/main-page-online-champions/main-page-online-champions.component';
import {MainPageQuickGameComponent} from './components/main-page/main-page-quick-game/main-page-quick-game.component';
import {MainPageJoinTournamentsComponent} from './components/main-page/main-page-join-tournaments/main-page-join-tournaments.component';
import {MainPageJoinTournamentCardComponent} from './components/main-page/main-page-join-tournaments/main-page-join-tournament-card/main-page-join-tournament-card.component';
import {MainPageTournamentsTodayComponent} from './components/main-page/main-page-tournaments-today/main-page-tournaments-today.component';
import {MainPageTournamentsTodayRowComponent} from './components/main-page/main-page-tournaments-today/main-page-tournaments-today-row/main-page-tournaments-today-row.component';
import {MainPageTournamentsTodayRowCardComponent} from './components/main-page/main-page-tournaments-today/main-page-tournaments-today-row/main-page-tournaments-today-row-card/main-page-tournaments-today-row-card.component';
import {MainPageSingleGameComponent} from "@app/modules/main/components/main-page/main-page-single-game/main-page-single-game.component";
import {GameModule} from "@app/modules/game/game.module";
import {ReactiveFormsModule} from "@angular/forms";
import {MainPagePartnersComponent} from './components/main-page/main-page-partners/main-page-partners.component';
import {MainPagePartnerRowComponent} from './components/main-page/main-page-partners/main-page-partner-row/main-page-partner-row.component';
import {MainPagePartnerCardComponent} from './components/main-page/main-page-partners/main-page-partner-row/main-page-partner-card/main-page-partner-card.component';
import {MainPagePinnedNewsComponent} from './components/main-page/main-page-pinned-news/main-page-pinned-news.component';
import {MainPageComponentHolderComponent} from './components/main-page/main-page-component-holder/main-page-component-holder/main-page-component-holder.component';
import {MainBannerComponent} from './components/banners/main-banner/main-banner.component';
import {MpHostDirective} from './components/main-page/main-page-component-holder/main-page-component-holder/mp-host.directive';
import {MainPageNewsBlockComponent} from './components/main-page/main-page-news/main-page-news-block/main-page-news-block.component';
import {ImageBannerComponent} from './components/banners/image-banner/image-banner.component';
import {HorizontalImageBannerComponent} from './components/banners/horizontal-image-banner/horizontal-image-banner.component';
import {OfflineTournamentService} from "@app/modules/app-common/services/offline-tournament.service";
import {MiniBannerComponent} from './components/banners/mini-banner/mini-banner.component';
import { MainPageFooterComponent } from './components/main-page/main-page-footer/main-page-footer.component';
import { FullShopBannerComponent } from './components/banners/full-shop-banner/full-shop-banner.component';
import {ShopBannerComponent} from "@app/modules/main/components/banners/shop-banner/shop-banner.component";

@NgModule({
  declarations: [
    MainPageComponent,
    MainPageHeaderComponent,
    MainPageNewsCaptionItemComponent,
    MainPageNewsBarComponent,
    MainPageNewsBarItemComponent,
    MainPageNewsComponent,
    MainPageNewsItemComponent,
    OfflineTournamentTimelineComponent,
    OfflineTournamentTimelineCardComponent,
    OfflineTournamentBlockComponent,
    MainPageLegaliseYourSkillsComponent,
    MainPageBecomeMemberComponent,
    MainPageOnlineChampionsComponent,
    MainPageQuickGameComponent,
    MainPageJoinTournamentsComponent,
    MainPageJoinTournamentCardComponent,
    MainPageTournamentsTodayComponent,
    MainPageTournamentsTodayRowComponent,
    MainPageTournamentsTodayRowCardComponent,
    MainPageSingleGameComponent,
    MainPagePartnersComponent,
    MainPagePartnerRowComponent,
    MainPagePartnerCardComponent,
    MainPagePinnedNewsComponent,
    MainPageComponentHolderComponent,
    MainBannerComponent,
    MpHostDirective,
    MainPageNewsBlockComponent,
    ImageBannerComponent,
    HorizontalImageBannerComponent,
    MiniBannerComponent,
    MainPageFooterComponent,
    ShopBannerComponent,
    FullShopBannerComponent,
  ],
  entryComponents: [
    MainPageLegaliseYourSkillsComponent,
    MainPageNewsCaptionItemComponent,
    MainPageNewsBarComponent,
    OfflineTournamentBlockComponent,
    MainBannerComponent,
    MainPageNewsBlockComponent,
    ImageBannerComponent,
    HorizontalImageBannerComponent,
    MainPageSingleGameComponent,
    MainPageBecomeMemberComponent,
    MainPageJoinTournamentsComponent,
    MainPagePartnersComponent,
    MainPageOnlineChampionsComponent,
    MainPageQuickGameComponent,
    MainPageTournamentsTodayComponent,
    MainPagePinnedNewsComponent,
    FullShopBannerComponent,
    ShopBannerComponent,
    MiniBannerComponent
  ],
  providers: [
    NewsServiceService,
    OfflineTournamentService,
  ],
  exports: [
    OfflineTournamentTimelineComponent,
    OfflineTournamentBlockComponent
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    MainRoutingModule,
    SvgModule,
    SharedModule,
    GameModule,
    ReactiveFormsModule,
  ]
})
export class MainModule { }
