import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ChessFooterInfoComponent} from './chess-footer-info/chess-footer-info.component';
import {ChessFooterNewsComponent} from './chess-footer-news/chess-footer-news.component';
import {ChessFooterComponent} from './chess-footer.component';
import {NewsCardComponent} from './chess-footer-news/news-card/news-card.component';
import {NewsLastComponent} from './chess-footer-news/news-last/news-last.component';
import { SharedModule } from '../../shared/shared.module';
import { ChessFooterInformationComponent } from './chess-footer-information/chess-footer-information.component';
import { InfoPlayersComponent } from './chess-footer-information/info-players/info-players.component';
import { InfoAllPlayersModalComponent } from './info-all-players-modal/info-all-players-modal.component';
import { InfoContentComponent } from './chess-footer-information/info-content/info-content.component';
import { InfoRoundsComponent } from './chess-footer-information/info-rounds/info-rounds.component';
import { ScheduleResourceService } from './schedule/schedule-resource.service';
import { TeamPlayerResourceService } from './team-players/team-players-resource.service';
import { StoreModule } from '@ngrx/store';
import * as fromSchedule from './schedule/schedule.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ScheduleEffects } from './schedule/schedule.effects';
import { TeamPlayerEffects } from './team-players/team-players.effects';
import * as fromTeamPlayers from './team-players/team-players.reducer';
import { CoreModule } from '../core/core.module';
import { ChessFooterMediaComponent } from './chess-footer-media/chess-footer-media.component';
import { MediaListComponent } from './media-list/media-list.component';
import { MediaFileEffects } from './media-files/media-files.effects';
import * as fromMediaFiles from './media-files/media-files.reducer';
import { MediaFilesResourceService } from './media-files/media-files-resource.service';
import { MediaModalComponent } from './media-modal/media-modal.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NewsResourceService } from './news/news-resource.service';
import {NewsEffects} from './news/news.effects';
import * as fromNews from './news/news.reducer';
import { ResultsMainComponent } from './results-main/results-main.component';
import { ChessFooterResultsComponent } from './chess-footer-results/chess-footer-results.component';
import { ResultsListComponent } from './results-list/results-list.component';
import {NewsPaginationService} from './news/news-pagination.service';
import { ResultsListSwissComponent } from './results-list-swiss/results-list-swiss.component';
import { ChessFooterPlayersComponent } from './chess-footer-players/chess-footer-players.component';
import { ResultsCardsComponent } from './results-cards/results-cards.component';
import { ResultsListCircularComponent } from './results-list-circular/results-list-circular.component';
@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    NgxSmartModalModule,
    StoreModule.forFeature('schedule', fromSchedule.reducer),
    StoreModule.forFeature('teamPlayers', fromTeamPlayers.reducer),
    StoreModule.forFeature('mediaFiles', fromMediaFiles.reducer),
    StoreModule.forFeature('news', fromNews.reducer),
    EffectsModule.forFeature([
      ScheduleEffects,
      TeamPlayerEffects,
      MediaFileEffects,
      NewsEffects
    ]),
  ],
  declarations: [
    ChessFooterComponent,
    ChessFooterInfoComponent,
    ChessFooterNewsComponent,
    ChessFooterPlayersComponent,
    NewsLastComponent,
    NewsCardComponent,
    ChessFooterInformationComponent,
    InfoPlayersComponent,
    InfoAllPlayersModalComponent,
    InfoContentComponent,
    InfoRoundsComponent,
    ChessFooterMediaComponent,
    MediaListComponent,
    MediaModalComponent,
    ChessFooterResultsComponent,
    ResultsMainComponent,
    ResultsListComponent,
    ResultsCardsComponent,
    ResultsListSwissComponent,
    ResultsListCircularComponent,
  ],
  providers: [
    ScheduleResourceService,
    TeamPlayerResourceService,
    MediaFilesResourceService,
    NewsResourceService,
    NewsPaginationService,
  ],
  exports: [
    ChessFooterComponent
  ]
})
export class ChessFooterModule { }
