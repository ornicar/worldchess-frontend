import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChessBoardAreaModule } from '../broadcast/chess/chess-page/chess-board-area/chess-board-area.module';
import { ChessPageModule } from '../broadcast/chess/chess-page/chess-page.module';
import { HeaderModule } from '../broadcast/components/header/header.module';
import { BoardResolveGuard } from '../broadcast/guards/board-resolve.guard';
import { FideTournamentResolveGuard } from '../broadcast/guards/fide-tournament-resolve-guard.service';
import { SharedModule } from '../shared/shared.module';
import { ChessPageComponent } from './components/chess-page/chess-page.component';
import { HeaderComponent } from './components/header/header.component';
import { LivestreamContainerComponent } from './components/livestream-container/livestream-container.component';
import { WidgetLayoutComponent } from './components/widget-layout/widget-layout.component';
import { WidgetPageComponent } from './components/widget-page/widget-page.component';
import { WidgetGameContainerComponent } from './containers/widget-game-container.component';
import { WidgetTournamentContainerComponent } from './containers/widget-tournament-container.component';
import { WidgetConfigGuard } from './widget-config-guard.service';
import { ChessNavigationModule } from '@app/broadcast/chess/chess-page/chess-board-area/chess-navigation/chess-navigation.module';
import { SvgModule } from '@app/modules/svg/svg.module';

const routes: Routes = [
  {
    path: 'embedded-widget',
    resolve: {
      config: WidgetConfigGuard
    },
    children: [
      {
        path: 'tournament/:tournament',
        resolve: {
          tournament: FideTournamentResolveGuard
        },
        children: [
          {
            path: '',
            component: WidgetTournamentContainerComponent,
          },
          {
            path: 'pairing/:pairing',
            resolve: {
              board: BoardResolveGuard
            },
            component: WidgetGameContainerComponent,
          },
          {
            path: ':tour/:boardSlug',
            resolve: {
              board: BoardResolveGuard,
            },
            component: WidgetGameContainerComponent,
          }
        ]
      }
    ]
  },
];

@NgModule({
  declarations: [
    WidgetTournamentContainerComponent,
    WidgetGameContainerComponent,
    WidgetLayoutComponent,
    WidgetPageComponent,
    HeaderComponent,
    ChessPageComponent,
    LivestreamContainerComponent
  ],
  providers: [
    WidgetConfigGuard
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeaderModule,
    ChessBoardAreaModule,
    ChessPageModule,
    SharedModule,
    ChessNavigationModule,
    SvgModule
  ]
})
export class EmbeddedWidgetModule {
}
