import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LayoutModule } from '../layout/layout.module';
import { PurchasesModule } from '../purchases/purchases.module';
import { BroadcastRoutingModule } from './broadcast-routing.module';
import { ChessFooterModule } from './chess-footer/chess-footer.module';
import { ChessPageModule } from './chess/chess-page/chess-page.module';
import { BroadcastPageComponent } from './components/broadcast-page/broadcast-page.component';
import { MatchtPageContainerComponent } from './components/containers/match-page-container.component';
import { BoardPageContainerComponent } from './components/containers/pairing-page-container.component';
import { TourMultiboardPageContainerComponent } from './components/containers/tour-multiboard-page-container.component';
import { TourPageContainerComponent } from './components/containers/tour-page-container.component';
import { TournamentPageContainerComponent } from './components/containers/tournament-page-container.component';
import { LondonTimerComponent } from './components/london-timer/london-timer.component';
import { EventTournamentResolveGuard } from './guards/event-tournament-resolve.guard';
import { FounderTournamentResolveGuard } from './guards/founder-tournament-resolve-guard.service';
import { MatchResolveGuard } from './guards/match-resolve.guard';
import { BoardResolveGuard } from './guards/board-resolve.guard';
import { OnlineTournamentResolveGuard } from './guards/online-tournament-resolve-guard.service';
import { TourResolveGuard } from './guards/tour-resolve.guard';
import { FideTournamentResolveGuard } from './guards/fide-tournament-resolve-guard.service';
import { SharedModule } from '../shared/shared.module';
import { HeaderModule } from './components/header/header.module';

@NgModule({
  imports: [
    CommonModule,
    BroadcastRoutingModule,
    PurchasesModule,
    SharedModule,
    ChessPageModule,
    ChessFooterModule,
    HeaderModule,
    LayoutModule,
  ],
  providers: [
    EventTournamentResolveGuard,
    FideTournamentResolveGuard,
    OnlineTournamentResolveGuard,
    FounderTournamentResolveGuard,
    TourResolveGuard,
    MatchResolveGuard,
    BoardResolveGuard
  ],
  declarations: [
    LondonTimerComponent,
    BroadcastPageComponent,
    TournamentPageContainerComponent,
    TourMultiboardPageContainerComponent,
    TourPageContainerComponent,
    MatchtPageContainerComponent,
    BoardPageContainerComponent
  ],
  exports: []
})
export class BroadcastModule { }
