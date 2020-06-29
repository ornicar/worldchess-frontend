import { GameDataService } from './service/game-data.service';
import { GameTranslateService } from './service/game-translate.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamePageComponent } from './game-page/game-page.component';
import { GameRoutingModule } from './game-routing.module';
import { NgxsModule } from '@ngxs/store';
import { GameState } from './state/game.state';
import { GameResourceService } from './state/game.resouce.service';
import { PlayerPanelComponent } from './player-panel/player-panel.component';
import { PipesModule } from '@app/shared/pipes/pipes.module';
import { SearchOpponentComponent } from './search-opponent/search-opponent.component';
import { MovesHistoryComponent } from './moves-history/moves-history.component';
import { HistoryMoveComponent } from './moves-history/history-move/history-move.component';
import { HistoryMoveFigureComponent } from './moves-history/history-move-figure/history-move-figure.component';
import { GameNotificationComponent } from './game-notification/game-notification.component';
import { LeaveGameGuard } from './guards/leave-game.guard';
import { SharedModule } from '@app/shared/shared.module';
import { ModalWindowsModule } from '@app/modal-windows/modal-windows.module';
import { SvgModule } from '@app/modules/svg/svg.module';
import { GameChessBoardComponent } from './new-generation/chess-board/chess-board.component';
import { GameUserBadgeComponent } from './new-generation/user-badge/user-badge.component';
import { GameMenuComponent } from './new-generation/game-menu/game-menu.component';
import { GameMenuTournamentInfoComponent } from './new-generation/game-menu-tournament-info/game-menu-tournament-info.component';
import { GameLaunchSettingsComponent } from './new-generation/launch-settings/launch-settings.component';
import { GameNotificationsComponent } from './new-generation/notifications/notifications.component';
import { TimeControlFormComponent } from './_shared/time-control-form/time-control-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameResultComponent } from './new-generation/game-result/game-result.component';
import { GameRatingModeSelectFormComponent } from './_shared/game-rating-mode-select-form/game-rating-mode-select-form.component';
import { CapturedFiguresComponent } from './new-generation/captured-figures/captured-figures.component';
import { GameMainMenuComponent } from './new-generation/main-menu/main-menu.component';
import { AntiCheatingComponent } from './new-generation/anti-cheating/anti-cheating.component';
import { ReviewSliderComponent } from './new-generation/review-slider/review-slider.component';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import { OnlineTournamentResolveGuard } from '@app/broadcast/guards/online-tournament-resolve-guard.service';
import { GameScreenService } from '@app/modules/game/state/game.screen.service';
import { GameMenuLogoComponent } from './new-generation/game-menu-logo/game-menu-logo.component';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { GameRatingSelectFormComponent } from './_shared/game-rating-select-form/game-rating-select-form.component';
import { MyGamesComponent } from './components/my-games/my-games.component';
import { InfiniteScrollComponent } from './_shared/infinite-scroll/infinite-scroll.component';
import { PlayerQueueComponent } from './new-generation/player-queue/player-queue.component';
import { OnlineTournamentComponent } from './tournaments/components/online-tournament/online-tournament.component';
import { GameService } from '@app/modules/game/state/game.service';
import { TournamentsPageComponent } from './tournaments/tournaments-page/tournaments-page.component';
import { GamingSelectorComponent } from './gaming-selector/gaming-selector.component';
import { TournamentCardComponent } from './tournaments/tournament-card/tournament-card.component';
import { TournamentTimelineComponent } from './tournaments/components/tournament-timeline/tournament-timeline.component';
import { TournamentListComponent } from './tournaments/tournament-list/tournament-list.component';
import { GameChatComponent } from './components/game-chat/game-chat.component';
import { GameChatMessageComponent } from './components/game-chat/game-chat-message/game-chat-message.component';
import { TournamentStandingsComponent } from './tournaments/components/tournament-standings/tournament-standings.component';
import { GameChatPlayerComponent } from './components/game-chat/game-chat-player/game-chat-player.component';
import { ChatModule } from '@app/broadcast/chess/chat/chat.module';
import { TournamentGamePageComponent } from './tournaments/tournament-game-page/tournament-game-page.component';
import { RoundsTimeLineComponent } from './tournaments/components/rounds-time-line/rounds-time-line.component';
import { ChessBoardModule } from '@app/broadcast/chess/chess-page/chess-board/chess-board.module';
import { OnlineTournamentWidgetComponent } from './tournaments/components/online-tournament-widget/online-tournament-widget.component';
import { TournamentCountdownComponent } from './tournaments/tournament-countdown/tournament-countdown.component';
import { TournamentState } from '@app/modules/game/tournaments/states/tournament.state';
import { OnlineTournamentResourceService } from '@app/modules/game/tournaments/providers/tournament.resource.service';
import { TournamentNextOpponentComponent } from './tournaments/tournament-next-opponent/tournament-next-opponent.component';
import { GameMainComponent } from './game-main/game-main.component';
import { GameMainHeaderComponent } from './game-main/game-main-header/game-main-header.component';
import { GameMainPlayersBarComponent } from './game-main/game-main-players-bar/game-main-players-bar.component';
import { GameMainPlayersBarItemComponent } from './game-main/game-main-players-bar/game-main-players-bar-item/game-main-players-bar-item.component';
import { GameMainPlayerComponent } from './game-main/game-main-players-bar/game-main-players-bar-item/game-main-player/game-main-player.component';
import { GameMainTodayComponent } from './game-main/game-main-today/game-main-today.component';
import { GameMainBestPlayerComponent } from './game-main/game-main-best-player/game-main-best-player.component';
import { PlayerDataService } from '@app/modules/game/service/player-data-service';
import { GameMainTournamentComponent } from './game-main/game-main-tournament/game-main-tournament.component';
import { GameMainAreaComponent } from './game-main/game-main-area/game-main-area.component';
import { GameMainUpdatesComponent } from './game-main/game-main-updates/game-main-updates.component';
import { GameMainButtonBlockComponent } from './game-main/game-main-button-block/game-main-button-block.component';
import { GameMainTournamentPanesComponent } from './game-main/game-main-tournament-panes/game-main-tournament-panes.component';
import { GameMainTournamentPaneComponent } from './game-main/game-main-tournament-panes/game-main-tournament-pane/game-main-tournament-pane.component';
import { GameMainNewTournamentComponent } from './game-main/game-main-tournament-panes/game-main-new-tournament/game-main-new-tournament.component';
import { OnlineTournamentService } from '@app/modules/game/tournaments/services/tournament.service';
import { GamePlayerRatingService } from '@app/modules/game/service/game-player-rating-service';
import { GameMainJoinTournamentComponent } from './game-main/game-main-join-tournament/game-main-join-tournament.component';
import { GameMaineTimelineComponent } from './game-main/game-maine-timeline/game-maine-timeline.component';
import { GameMainSvgTournamentComponent } from './game-main/game-main-svg-tournament/game-main-svg-tournament.component';
import { GameMainFindOpponentComponent } from './game-main/game-main-find-opponent/game-main-find-opponent.component';
import { GameChampionsTableComponent } from './game-main/game-champions-table/game-champions-table.component';
import { GameMainAllTimeChempionComponent } from './game-main/game-main-all-time-chempion/game-main-all-time-chempion.component';
import { GameMainAdvertisementComponent } from './game-main/game-main-advertisement/game-main-advertisement.component';
import { GameMainAdvertisementRedComponent } from './game-main/game-main-advertisement-red/game-main-advertisement-red.component';
import { GameMainFideTextComponent } from './game-main/game-main-fide-text/game-main-fide-text.component';
import { GameMainRatingPointsComponent } from './game-main/game-main-rating-points/game-main-rating-points.component';
import { GameMainLegalizeSkilsComponent } from './game-main/game-main-legalize-skils/game-main-legalize-skils.component';
import { GameMainBeautifulOnlineChessComponent } from './game-main/game-main-beautiful-online-chess/game-main-beautiful-online-chess.component';
import { GameMainBoardMainComponent } from './game-main/game-main-beautiful-online-chess/game-main-board-main/game-main-board-main.component';
import { GameMainPhonesComponent } from './game-main/game-main-beautiful-online-chess/game-main-phones/game-main-phones.component';
import { GameMainBoardSmallComponent } from './game-main/game-main-beautiful-online-chess/game-main-board-small/game-main-board-small.component';
import { GameMainChatComponent } from './game-main/game-main-beautiful-online-chess/game-main-chat/game-main-chat.component';
import { GameMainLobbyComponent } from './game-main/game-main-beautiful-online-chess/game-main-lobby/game-main-lobby.component';
import { GameMainBoardDashedComponent } from './game-main/game-main-beautiful-online-chess/game-main-board-dashed/game-main-board-dashed.component';
import { GameMainBoardStylesComponent } from './game-main/game-main-beautiful-online-chess/game-main-board-styles/game-main-board-styles.component';
import { GameMainBoardCardsComponent } from './game-main/game-main-beautiful-online-chess/game-main-cards/game-main-cards.component';
import { GameMainButtonBlockMobileComponent } from './game-main/game-main-button-block-mobile/game-main-button-block-mobile.component';
import { OnlineTournamentPgnWidgetComponent } from './tournaments/components/online-tournament-pgn-widget/online-tournament-pgn-widget.component';
import { GameFooterMainComponent } from '../app-common/components/game-footer-main/game-footer-main.component';
import { GameFooterTurnamentsComponent } from './game-footer-turnaments/game-footer-turnaments.component';
import { TournamentGameResultComponent } from './tournaments/tournament-game-page/tournament-game-result/tournament-game-result.component';
import { ReturnGameComponent } from './components/return-game/return-game.component';
import { TournamentGameState } from '@app/modules/game/tournaments/states/tournament.game.state';
import { AppCommonModule } from '@app/modules/app-common/app-common.module';
import { GameLanguagesComponent } from './components/game-languages/game-languages.component';
import { AccountModule } from '@app/account/account-module/account.module';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GameRoutingModule,
    NgxsModule.forFeature([GameState, TournamentState, TournamentGameState]),
    PipesModule,
    SharedModule,
    ModalWindowsModule,
    SvgModule,
    ChatModule,
    ChessBoardModule,
    AppCommonModule,
    AccountModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
      defaultLanguage: 'en',
    }),
    // RatingModule
  ],
  providers: [
    CountryResourceService,
    OnlineTournamentResolveGuard,
    GameResourceService,
    OnlineTournamentResourceService,
    OnlineTournamentService,
    LeaveGameGuard,
    GameScreenService,
    GameSharedService,
    GameService,
    GameDataService,
    GameTranslateService,
    PlayerDataService,
    GamePlayerRatingService,
  ],
  declarations: [
    PlayerPanelComponent,
    GameNotificationComponent,
    MovesHistoryComponent,
    SearchOpponentComponent,
    GamePageComponent,
    HistoryMoveComponent,
    HistoryMoveFigureComponent,
    // temporary
    GameChessBoardComponent,
    GameUserBadgeComponent,
    GameMenuComponent,
    GameLaunchSettingsComponent,
    GameNotificationsComponent,
    TimeControlFormComponent,
    GameResultComponent,
    GameRatingModeSelectFormComponent,
    CapturedFiguresComponent,
    GameMainMenuComponent,
    AntiCheatingComponent,
    ReviewSliderComponent,
    GameMenuLogoComponent,
    GameRatingSelectFormComponent,
    MyGamesComponent,
    InfiniteScrollComponent,
    PlayerQueueComponent,
    OnlineTournamentComponent,
    TournamentsPageComponent,
    GamingSelectorComponent,
    TournamentCardComponent,
    TournamentTimelineComponent,
    GameChatComponent,
    TournamentListComponent,
    GameChatMessageComponent,
    GameChatPlayerComponent,
    TournamentStandingsComponent,
    TournamentGamePageComponent,
    TournamentCountdownComponent,
    RoundsTimeLineComponent,
    OnlineTournamentWidgetComponent,
    TournamentNextOpponentComponent,
    GameMainComponent,
    GameMainHeaderComponent,
    GameMainPlayersBarComponent,
    GameMainPlayersBarItemComponent,
    GameMainPlayerComponent,
    GameMainTodayComponent,
    GameMainBestPlayerComponent,
    GameMainTournamentComponent,
    GameMainAreaComponent,
    GameMainUpdatesComponent,
    GameMainButtonBlockComponent,
    GameMainTournamentPanesComponent,
    GameMainTournamentPaneComponent,
    GameMainNewTournamentComponent,
    GameMainJoinTournamentComponent,
    GameMaineTimelineComponent,
    GameMainSvgTournamentComponent,
    GameMainFindOpponentComponent,
    GameChampionsTableComponent,
    GameMainAllTimeChempionComponent,
    GameMainAdvertisementComponent,
    GameMainAdvertisementRedComponent,
    GameMainFideTextComponent,
    GameMainRatingPointsComponent,
    GameMainLegalizeSkilsComponent,
    GameMainBeautifulOnlineChessComponent,
    GameMainBoardMainComponent,
    GameMainPhonesComponent,
    GameMainBoardSmallComponent,
    GameMainChatComponent,
    GameMainLobbyComponent,
    GameMainBoardDashedComponent,
    GameMainBoardStylesComponent,
    GameMainBoardCardsComponent,
    OnlineTournamentPgnWidgetComponent,
    GameMainButtonBlockMobileComponent,
    GameFooterMainComponent,
    GameFooterTurnamentsComponent,
    GameMenuTournamentInfoComponent,
    TournamentGameResultComponent,
    ReturnGameComponent,
    GameLanguagesComponent,
  ],
  exports: [
    TimeControlFormComponent,
    GameRatingModeSelectFormComponent,
    GameRatingSelectFormComponent,
    GamingSelectorComponent,
    GameChessBoardComponent,
    GameFooterMainComponent,
  ],
})
export class GameModule {}
