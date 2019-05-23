import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {EMPTY, merge, Observable, of} from 'rxjs';
import {fromArray} from 'rxjs/internal/observable/fromArray';
import {catchError, mapTo, switchMap, map} from 'rxjs/operators';
import {AddWidget} from '../../../../widget/app/services/widget.actions';
import {IWidgetResponseEntities} from '../../../../widget/app/services/widget.service';
import {BoardLoadService} from '../../../broadcast/core/board/board-load.service';
import {AddBoard} from '../../../broadcast/core/board/board.actions';
import {AddMatch} from '../../../broadcast/core/match/match.actions';
import {AddTour} from '../../../broadcast/core/tour/tour.actions';
import {AddTournament} from '../../../broadcast/core/tournament/tournament.actions';
import {MainPageResourceService} from './main-page-resource.service';
import {MainPageActionsTypes, MainPageGetInfo, MainPageGetInfoError, MainPageSetInfo} from './main-page.actions';
import { PlayerLoadService } from '../../../broadcast/core/player/player-load.service';
import { AddPlayer } from '../../../broadcast/core/player/player.actions';

@Injectable()
export class MainPageEffects {

  constructor(
    private actions$: Actions,
    private mainPageResource: MainPageResourceService,
    private boardLoad: BoardLoadService,
    private playerLoad: PlayerLoadService
  ) {}

  @Effect()
  getInfo$ = this.actions$.pipe(
    ofType<MainPageGetInfo>(MainPageActionsTypes.GetInfo),
    switchMap(() => this.mainPageResource.getInfo().pipe(
      switchMap(({ banner, mini_banner_1, mini_banner_2, mini_banner_3, widgetData }) => {
        const banner$ = of(new MainPageSetInfo({ banner, mini_banner_1, mini_banner_2, mini_banner_3 }));
        const widget$ = widgetData ? this.getWidgetDataActions(widgetData) : EMPTY;

        return merge(banner$, widget$);
      }),
      catchError(({ resp = {} }) => {
        return of(new MainPageGetInfoError({ error: resp.error }));
      })
    ))
  );

  private getWidgetDataActions(
    { widget, tournament, tour, match, board }: IWidgetResponseEntities
  ): Observable<Action> {
    const actions$: Observable<Action>[] = [];
    actions$.push(
      fromArray([
        new AddWidget({ widget }),
        new AddTournament({ tournament })
      ])
    );

    if (tour) {
      actions$.push(of(new AddTour({ tour })));
    }

    if (match) {
      actions$.push(of(new AddMatch({ match })));
    }

    if (board) {
      // now widget contains the whole players
      const { white_player, black_player, ...rest } = board;
      const cleanBoard = {
        ...rest,
        white_player: white_player && white_player.fide_id,
        black_player: black_player && black_player.fide_id
      };
      if (white_player) {
        actions$.push(of(new AddPlayer({ player: white_player })));
      }

      if (black_player) {
        actions$.push(of(new AddPlayer({ player: black_player })));
      }

      actions$.push(of(new AddBoard({ board: cleanBoard })));
    }

    return merge(...actions$);
  }
}
