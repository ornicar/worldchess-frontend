import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as fromRoot from '../../../reducers';
import { TournamentResourceService } from '../../core/tournament/tournament-resource.service';
import { EventResourceService } from '../../core/event/event-resource.service';
import { TourResourceService } from '../../core/tour/tour-resource.service';
import { MatchResourceService } from '../../core/match/match-resource.service';
import { BoardResourceService } from '../../core/board/board-resource.service';
import {
  GetTournaments,
  HeaderActionTypes,
  GetEvents, GetTours,
  GetMatches,
  GetBoards,
  LoadTournaments,
  LoadEvents,
  LoadTours,
  LoadMatches
} from './header.actions';
import { LoadBoards } from '../../core/board/board.actions';


@Injectable()
export class HeaderEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<fromRoot.State>,
    private tournamentResource: TournamentResourceService,
    private eventResource: EventResourceService,
    private tourResource: TourResourceService,
    private matchResource: MatchResourceService,
    private boardResource: BoardResourceService,
  ) {}

  @Effect()
  getTournaments$: Observable<Action> = this.actions$.pipe(
    ofType<GetTournaments>(HeaderActionTypes.GetTournaments),
    switchMap((action) => this.tournamentResource.getAll(action.payload.options).pipe(
      map(tournaments => new LoadTournaments({ tournaments })),
    )),
  );

  @Effect()
  getEvents$: Observable<Action> = this.actions$.pipe(
    ofType<GetEvents>(HeaderActionTypes.GetEvents),
    switchMap(() => this.eventResource.getAll().pipe(
      map(events => new LoadEvents({ events })),
    )),
  );

  @Effect()
  getTours$: Observable<Action> = this.actions$.pipe(
    ofType<GetTours>(HeaderActionTypes.GetTours),
    switchMap(() => this.tourResource.getAll().pipe(
      map(tours => new LoadTours({ tours }))
    ))
  );

  @Effect()
  getMatches$: Observable<Action> = this.actions$.pipe(
    ofType<GetMatches>(HeaderActionTypes.GetMatches),
    switchMap(() => this.matchResource.getAll().pipe(
      map(matches => new LoadMatches({ matches })),
    )),
  );

  @Effect()
  getBoards$: Observable<Action> = this.actions$.pipe(
    ofType<GetBoards>(HeaderActionTypes.GetBoards),
    switchMap(() => this.boardResource.getAll().pipe(
      map(boards => new LoadBoards({ boards })),
    )),
  );
}
