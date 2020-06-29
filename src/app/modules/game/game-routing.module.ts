import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { GamePageComponent } from './game-page/game-page.component';
import { LeaveGameGuard } from './guards/leave-game.guard';
import { SvgModule } from '@app/modules/svg/svg.module';
import { MyGamesComponent } from '@app/modules/game/components/my-games/my-games.component';
import { IsAuthorizedGuard } from '@app/auth/is-authorized.guard';
import { TournamentsPageComponent } from '@app/modules/game/tournaments/tournaments-page/tournaments-page.component';
import { OnlineTournamentComponent } from '@app/modules/game/tournaments/components/online-tournament/online-tournament.component';
import { OnlineTournamentResolveGuard } from '@app/broadcast/guards/online-tournament-resolve-guard.service';
import { TournamentGamePageComponent } from '@app/modules/game/tournaments/tournament-game-page/tournament-game-page.component';
import { GameMainComponent } from '@app/modules/game/game-main/game-main.component';

const routes: Routes = [
  {
    path: '',
    component: GameMainComponent,
    canDeactivate: [
      // LeaveGameGuard,
    ]
  },
  {
    path: 'singlegames',
    component: GamePageComponent,
    canDeactivate: [
      // LeaveGameGuard,
    ]
  },

  {
    path: 'mygames',
    component: MyGamesComponent,
    canActivate: [
      IsAuthorizedGuard
    ],
  },
  {
    path: 'tournament/:tournament',
    component: OnlineTournamentComponent,
    resolve: {
      tournament: OnlineTournamentResolveGuard
    },
  },
  {
    path: 'tournaments',
    component: TournamentsPageComponent,
  },
  {
    path: 'singlegames/:board_id',
    component: GamePageComponent,
    canDeactivate: [
      LeaveGameGuard,
    ],
  },
  {
    path: 'singlegames/invite/:invite_code',
    component: GamePageComponent,
    canDeactivate: [
    ]
  },
  {
    path: 'singlegames/invite/:invite_code/:opp_mode',
    component: GamePageComponent,
    canDeactivate: [
    ]
  },
  {
    path: 'tournament/pairing/:board_id',
    component: TournamentGamePageComponent,
  },
  {
    path: 'not-found',
    loadChildren: '../../modules/not-found-page/not-found-page.module#NotFoundPageModule',
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SvgModule,
  ],
  exports: [RouterModule]
})
export class GameRoutingModule { }
