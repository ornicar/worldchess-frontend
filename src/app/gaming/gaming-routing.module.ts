import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MatchtPageContainerComponent} from '../broadcast/components/containers/match-page-container.component';
import {BoardPageContainerComponent} from '../broadcast/components/containers/pairing-page-container.component';
import {TourMultiboardPageContainerComponent} from '../broadcast/components/containers/tour-multiboard-page-container.component';
import {TourPageContainerComponent} from '../broadcast/components/containers/tour-page-container.component';
import {TournamentPageContainerComponent} from '../broadcast/components/containers/tournament-page-container.component';
import {BoardResolveGuard} from '../broadcast/guards/board-resolve.guard';
import {FideTournamentResolveGuard} from '../broadcast/guards/fide-tournament-resolve-guard.service';
import {MatchResolveGuard} from '../broadcast/guards/match-resolve.guard';
import {OnlineTournamentResolveGuard} from '../broadcast/guards/online-tournament-resolve-guard.service';
import {TourResolveGuard} from '../broadcast/guards/tour-resolve.guard';
import {GamePlayPageContainerComponent} from './containers/game-play-page-container.component';
import { TournamentsOnlineComponent } from './containers/tournaments-online/tournaments-online.component';

const routes: Routes = [
  {
    path: 'gaming',
    children: [
      {
        path: 'tournament',
        children: [
          {
            path: '',
            pathMatch: 'full',
            component: TournamentsOnlineComponent,
          },
          {
            path: ':tournament',
            resolve: {
              tournament: FideTournamentResolveGuard
            },
            children: [
              {
                path: 'game/:pairing/play',
                resolve: {
                  board: BoardResolveGuard
                },
                component: GamePlayPageContainerComponent
              }
            ]
          },

        ]
      }
    ]
  },
  {
    path: 'online-tournament/:tournament',
    resolve: {
      tournament: OnlineTournamentResolveGuard
    },
    children: [
      {
        path: '',
        component: TournamentPageContainerComponent,
      },
      {
        path: 'tour/:tour',
        resolve: {
          tour: TourResolveGuard
        },
        children: [
          {
            path: '',
            component: TourPageContainerComponent
          },
          {
            path: 'multiboard',
            component: TourMultiboardPageContainerComponent
          }
        ],
      },
      {
        path: 'match/:match',
        resolve: {
          match: MatchResolveGuard
        },
        component: MatchtPageContainerComponent
      },
      {
        path: 'pairing/:pairing',
        resolve: {
          board: BoardResolveGuard
        },
        component: BoardPageContainerComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class GamingRoutingModule { }
