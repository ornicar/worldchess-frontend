import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '@app/shared/shared.module';
import { LayoutModule } from '@app/layout/layout.module';
import { RatingRoutingModule } from './rating-routing.module';
import { CountryComponent } from './country/country.component';
import { PlayerLabelsComponent } from './player-labels/player-labels.component';
import { RatingListPageComponent } from './rating-list/rating-list-page.component';
import { RatingPlayerPageComponent } from './rating-player/rating-player-page.component';
import { PlayerListTailComponent } from './rating-list/player-list-tail/player-list-tail.component';
import { PlayerListTableComponent } from './rating-list/player-list-table/player-list-table.component';
import { RatingLineChartComponent } from './rating-player/rating-line-chart/rating-line-chart.component';
import { PlayerPortraitFooterComponent } from './rating-player/player-portrait-footer/player-portrait-footer.component';
import { GameStatisticPieChartComponent } from './rating-player/game-statistic-pie-chart/game-statistic-pie-chart.component';
import { RatingCarouselComponent } from '@app/modules/rating/rating-carousel/rating-carousel.component';
import { NguCarouselModule } from '@ngu/carousel';
import { PlayerRatingResourceService } from '../app-common/services/player-rating-resource.service';
import { SvgModule } from '@app/modules/svg/svg.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    RouterModule,
    RatingRoutingModule,
    LayoutModule,
    RatingRoutingModule,
    NguCarouselModule,
    SvgModule
  ],
  providers: [
    PlayerRatingResourceService,
  ],
  declarations: [
    RatingListPageComponent,
    RatingPlayerPageComponent,
    GameStatisticPieChartComponent,
    RatingLineChartComponent,
    PlayerPortraitFooterComponent,
    PlayerListTailComponent,
    PlayerListTableComponent,
    CountryComponent,
    PlayerLabelsComponent,
    RatingCarouselComponent,
  ],
  exports: [
    GameStatisticPieChartComponent,
    RatingLineChartComponent,
  ],
  bootstrap: [
    RatingCarouselComponent,
  ],
})
export class RatingModule {
}
