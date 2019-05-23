import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '@app/shared/shared.module';
import { LayoutModule } from '@app/layout/layout.module';
import { CoreModule } from '@app/broadcast/core/core.module';
import { RatingRoutingModule } from './rating-routing.module';
import { CountryComponent } from './country/country.component';
import * as fromCountries from '../../broadcast/core/country/country.reducer';
import { PlayerLabelsComponent } from './player-labels/player-labels.component';
import { RatingListPageComponent } from './rating-list/rating-list-page.component';
import { RatingPlayerPageComponent } from './rating-player/rating-player-page.component';
import * as fromPlayerRatings from '../../broadcast/core/playerRating/player-rating.reducer';
import { PlayerRatingEffects } from '@app/broadcast/core/playerRating/player-rating.effects';
import { PlayerListTailComponent } from './rating-list/player-list-tail/player-list-tail.component';
import { PlayerListTableComponent } from './rating-list/player-list-table/player-list-table.component';
import { RatingLineChartComponent } from './rating-player/rating-line-chart/rating-line-chart.component';
import { PlayerPortraitFooterComponent } from './rating-player/player-portrait-footer/player-portrait-footer.component';
import { GameStatisticPieChartComponent } from './rating-player/game-statistic-pie-chart/game-statistic-pie-chart.component';

export const routingRating: Routes = [
  {path: 'ratings', component: RatingListPageComponent},
  {path: 'ratings/', component: RatingListPageComponent},
  {path: 'ratings/:id', component: RatingPlayerPageComponent},
];

@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    RouterModule,
    RatingRoutingModule,
    StoreModule.forFeature('country', fromCountries.reducer),
    StoreModule.forFeature('player-rating', fromPlayerRatings.reducer),
    EffectsModule.forFeature([
      PlayerRatingEffects
    ]),
    LayoutModule,
  ],
  providers: [],
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
  ],
  exports: [
    RatingListPageComponent,
    RatingPlayerPageComponent,
  ]
})
export class RatingModule {
}
