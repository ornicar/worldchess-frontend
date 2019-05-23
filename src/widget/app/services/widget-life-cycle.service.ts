import { Injectable } from '@angular/core';
import { Update } from '@ngrx/entity';
import { Store } from '@ngrx/store';
import { forkJoin, Observable, of } from 'rxjs';
import { map, pluck, switchMap, tap } from 'rxjs/operators';
import { BoardLoadService } from '../../../app/broadcast/core/board/board-load.service';
import { IBoard } from '../../../app/broadcast/core/board/board.model';
import { MatchLoadService } from '../../../app/broadcast/core/match/match-load.service';
import { IMatch } from '../../../app/broadcast/core/match/match.model';
import { IDefaultEntities } from '../../../app/broadcast/core/models/default-entities';
import { TourLoadService } from '../../../app/broadcast/core/tour/tour-load.service';
import { ITour } from '../../../app/broadcast/core/tour/tour.model';
import { TournamentLoadService } from '../../../app/broadcast/core/tournament/tournament-load.service';
import { UpdateTournament } from '../../../app/broadcast/core/tournament/tournament.actions';
import { Tournament, TournamentStatus } from '../../../app/broadcast/core/tournament/tournament.model';
import * as fromRoot from '../../../app/reducers';
import { WidgetLoadService } from './widget-load.service';
import { UpdateWidget } from './widget.actions';
import { IWidget } from './widget.service';

@Injectable()
export class WidgetLifeCycleService {

  constructor(
    private store$: Store<fromRoot.State>,
    private tournamentLoad: TournamentLoadService,
    private widgetLoadService: WidgetLoadService,
    private tourLoadService: TourLoadService,
    private boardLoadService: BoardLoadService,
    private matchLoadService: MatchLoadService,
  ) { }

  private updateDefaultGame(widget: IWidget, defaults: IDefaultEntities): Observable<IWidget> {
    const tour$: Observable<ITour['id']> = defaults.tour_id
      ? this.tourLoadService.getWhenLacking(defaults.tour_id)
        .pipe(pluck('id'))
      : of(null);

    // Load with board.
    const board$: Observable<IBoard['id']> = defaults.board_id
      ? this.boardLoadService.getWithExpandAllWhenLacking(defaults.board_id)
        .pipe(pluck('id'))
      : of(null);

    const match$: Observable<IMatch['id']> = defaults.match_id
      ? this.matchLoadService.getWhenLacking(defaults.match_id)
        .pipe(pluck('id'))
      : of(null);

    return forkJoin(tour$, board$, match$).pipe(
      map(([tour, board, match]) => ({
        ...widget,
        tour,
        match,
        board
      })),
      tap(nextWidget => {
        // now we saved new defaults values in stores
        // then we should put new values into the widget
        const changed: Update<IWidget> = {
          id: nextWidget.id,
          changes: nextWidget
        };

        // now the new board is loaded and we can bring it by the id in board
        this.store$.dispatch(new UpdateWidget({ widget: changed }));
      })
    );
  }

  public load(id: string): Observable<IWidget> {
    return this.widgetLoadService.getWithExpandAll(id).pipe(
      switchMap(widget => {
        const isNeedDefaults = !widget.tour || !widget.board;

        if (isNeedDefaults) {
          return this.tournamentLoad.getDefaults(widget.tournament).pipe(
            switchMap(defaults => this.updateDefaultGame(widget, defaults))
          );
        } else {
          return of(widget);
        }
      })
    );
  }

  public complete(widget: IWidget): void {
    const tournament: Update<Tournament> = {
      id: widget.tournament,
      changes: {
        status: TournamentStatus.COMPLETED
      }
    };

    // as widget tournament id should not be changed, we change just tournament in the store
    this.store$.dispatch(new UpdateTournament({ tournament }));
  }

  public chooseNextGame(widget: IWidget): void {
    // it should save new defaults and all defaults$ got new values
    this.tournamentLoad.getNewDefaults(widget.tournament)
      .pipe(
        switchMap(defaults => this.updateDefaultGame(widget, defaults))
      )
      .subscribe();
  }
}
