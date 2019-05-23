import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { pluck, tap} from 'rxjs/operators';
import {AddBoard} from '../../../app/broadcast/core/board/board.actions';
import * as fromWidget from './widget.reducer';
import { WidgetService, IWidget } from './widget.service';
import { AddWidget } from './widget.actions';
import { TournamentLoadService } from '../../../app/broadcast/core/tournament/tournament-load.service';
import { TourLoadService } from '../../../app/broadcast/core/tour/tour-load.service';
import { MatchLoadService } from '../../../app/broadcast/core/match/match-load.service';
import { BoardLoadService } from '../../../app/broadcast/core/board/board-load.service';
import { AddTournament } from '../../../app/broadcast/core/tournament/tournament.actions';
import { AddTour } from '../../../app/broadcast/core/tour/tour.actions';
import { AddMatch } from '../../../app/broadcast/core/match/match.actions';
import { AddPlayer } from '../../../app/broadcast/core/player/player.actions';

@Injectable()
export class WidgetLoadService {

  constructor(
    private store$: Store<fromWidget.State>,
    private boardLoad: BoardLoadService,
    private tournamentLoad: TournamentLoadService,
    private tourLoad: TourLoadService,
    private matchLoad: MatchLoadService,
    private widgetService: WidgetService
  ) { }

  /**
   * Load from server.
   */
  getWithExpandAll(id: string): Observable<IWidget> {
    return this.widgetService.getWidgetWithExpandAllById(id).pipe(
      tap(({widget}) => this.store$.dispatch(new AddWidget({ widget }))),
      tap(({tournament}) => this.store$.dispatch(new AddTournament({ tournament }))),
      tap(({tour}) => tour && this.store$.dispatch(new AddTour({ tour }))),
      tap(({match}) => match && this.store$.dispatch(new AddMatch({ match }))),
      tap(({board}) => {
        if (board) {
          const { white_player, black_player, ...rest } = board;
          const cleanBoard = {
            ...rest,
            white_player: white_player && white_player.fide_id,
            black_player: black_player && black_player.fide_id
          };
          this.store$.dispatch(new AddBoard({ board: cleanBoard }));

          if (white_player) {
            this.store$.dispatch(new AddPlayer({ player: white_player }));
          }

          if (black_player) {
            this.store$.dispatch(new AddPlayer({ player: black_player }));
          }

        }
      }),
      pluck('widget')
    );
  }
}
