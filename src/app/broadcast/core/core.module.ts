import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {BoardLoadService} from './board/board-load.service';
import {BoardResourceService} from './board/board-resource.service';
import {BoardEffects} from './board/board.effects';
import * as fromBoard from './board/board.reducer';
import {CameraStoreModule} from './camera/camera-store.module';
import {CountryResourceService} from './country/country-resource.service';
import {CountryEffects} from './country/country.effects';
import * as fromCountry from './country/country.reducer';
import {EventLoadService} from './event/event-load.service';
import {EventResourceService} from './event/event-resource.service';
import {EventEffects} from './event/event.effects';
import * as fromEvent from './event/event.reducer';
import {MatchLoadService} from './match/match-load.service';
import {MatchResourceService} from './match/match-resource.service';
import {MatchEffects} from './match/match.effects';
import * as fromMatch from './match/match.reducer';
import {PlayerLoadService} from './player/player-load.service';
import {PlayerResourceService} from './player/player-resource.service';
import {PlayerEffects} from './player/player.effects';
import * as fromPlayer from './player/player.reducer';
import {BroadcastAuthInterceptorService} from './services/broadcast-auth-interceptor.service';
import {TeamResourceService} from './team/team-resource.service';
import {TeamEffects} from './team/team.effects';
import * as fromTeam from './team/team.reducer';
import {TourLoadService} from './tour/tour-load.service';
import {TourResourceService} from './tour/tour-resource.service';
import {TourEffects} from './tour/tour.effects';
import * as fromTour from './tour/tour.reducer';
import {TournamentLoadService} from './tournament/tournament-load.service';
import {TournamentResourceService} from './tournament/tournament-resource.service';
import {TournamentStateComponent} from './tournament/tournament-state/tournament-state.component';
import {TournamentEffects} from './tournament/tournament.effects';
import * as fromTournament from './tournament/tournament.reducer';
import * as fromNotification from './boardNotification/board-notification.reducer';
import * as fromPlayerRating from './playerRating/player-rating.reducer';
import {PlayerRatingEffects} from './playerRating/player-rating.effects';
import {PlayerRatingResourceService} from './playerRating/player-rating-resource.service';
import {SharedModule} from '../../shared/shared.module';
import {TournamentPartnersService} from './tournament/tournament-partners.service';
import {TournamentWidgetsService} from './tournament/tournament-widgets.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    CameraStoreModule,
    StoreModule.forFeature('country', fromCountry.reducer),
    StoreModule.forFeature('team', fromTeam.reducer),
    StoreModule.forFeature('player', fromPlayer.reducer),
    StoreModule.forFeature('event', fromEvent.reducer),
    StoreModule.forFeature('tournament', fromTournament.reducer),
    StoreModule.forFeature('tour', fromTour.reducer),
    StoreModule.forFeature('match', fromMatch.reducer),
    StoreModule.forFeature('board', fromBoard.reducer),
    StoreModule.forFeature('board-notification', fromNotification.reducer),
    StoreModule.forFeature('player-rating', fromPlayerRating.reducer),
    EffectsModule.forFeature([
      EventEffects,
      CountryEffects,
      TeamEffects,
      PlayerEffects,
      TournamentEffects,
      TourEffects,
      MatchEffects,
      BoardEffects,
      PlayerRatingEffects,
    ])
  ],
  declarations: [
    TournamentStateComponent
  ],
  exports: [
    TournamentStateComponent
  ]
})
export class CoreModule {
  static forRoot() {
    return {
      ngModule: CoreModule,
      providers: [
        CountryResourceService,
        TeamResourceService,
        PlayerResourceService,
        PlayerLoadService,
        EventResourceService,
        EventLoadService,
        TournamentResourceService,
        TournamentLoadService,
        TourResourceService,
        TourLoadService,
        MatchResourceService,
        MatchLoadService,
        BoardResourceService,
        BoardLoadService,
        PlayerRatingResourceService,
        TournamentPartnersService,
        TournamentWidgetsService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: BroadcastAuthInterceptorService,
          multi: true
        }
      ],
    };
  }
}
