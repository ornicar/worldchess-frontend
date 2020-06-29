import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatchtPageContainerComponent } from './components/containers/match-page-container.component';
import { BoardPageContainerComponent } from './components/containers/pairing-page-container.component';
import { TourMultiboardPageContainerComponent } from './components/containers/tour-multiboard-page-container.component';
import { TourPageContainerComponent } from './components/containers/tour-page-container.component';
import { TournamentPageContainerComponent } from './components/containers/tournament-page-container.component';
import { BoardResolveGuard } from './guards/board-resolve.guard';
import { EventTournamentResolveGuard } from './guards/event-tournament-resolve.guard';
import { MatchResolveGuard } from './guards/match-resolve.guard';
import { TourResolveGuard } from './guards/tour-resolve.guard';
import { FideTournamentResolveGuard } from './guards/fide-tournament-resolve-guard.service';
import { ChessFooterResultsComponent } from '@app/broadcast/chess-footer/chess-footer-results/chess-footer-results.component';
import { ResultsByPlayerComponent } from '@app/broadcast/chess-footer/results-by-player/results-by-player.component';

const routes: Routes = [
  {
    path: 'event/:event-name',
    resolve: {
      tournament: EventTournamentResolveGuard
    },
    component: TournamentPageContainerComponent,
  },
  {
    path: 'tournament/:tournament',
    resolve: {
      tournament: FideTournamentResolveGuard
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
        children: [
          {
            path: '',
            component: BoardPageContainerComponent,
          },
          {
            path: 'results',
            component: ChessFooterResultsComponent,
          },
          {
            path: 'results/:playerName',
            component: ResultsByPlayerComponent,
          },
        ],
      },
      {
        path: ':tourNumber',
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
          },
          {
            path: ':boardSlug',
            component: BoardPageContainerComponent,
            resolve: {
              board: BoardResolveGuard,
            },
          },
        ],
      },
    ]
  },
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ],
  providers: []
})
export class BroadcastRoutingModule { }
