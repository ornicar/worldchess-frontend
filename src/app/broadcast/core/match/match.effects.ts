import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {MatchResourceService} from './match-resource.service';
import {AddMatch, AddMatches, GetMatch, GetMatches, GetMatchesByTour, LoadMatches, MatchActionTypes} from './match.actions';

@Injectable()
export class MatchEffects {

  constructor(
    private actions$: Actions,
    private matchResource: MatchResourceService) {}

  @Effect()
  getMatch$: Observable<Action> = this.actions$.pipe(
    ofType<GetMatch>(MatchActionTypes.GetMatch),
    map((action: GetMatch) => action.payload.id),
    switchMap(id =>
      this.matchResource.getWithDefaults(id).pipe(
        map(({match}) => new AddMatch({ match }))
      )
    )
  );

  @Effect()
  matches$: Observable<Action> = this.actions$.pipe(
    ofType<GetMatches>(MatchActionTypes.GetMatches),
    switchMap(() =>
      this.matchResource.getAll().pipe(
        map(matches => new LoadMatches({ matches }))
      )
    )
  );

  @Effect()
  matchesByTour$: Observable<Action> = this.actions$.pipe(
    ofType<GetMatchesByTour>(MatchActionTypes.GetMatchesByTour),
    map((action: GetMatchesByTour) => action.payload.id),
    switchMap(id =>
      this.matchResource.getByTour(id).pipe(
        map(matches => new AddMatches({ matches }))
      )
    )
  );
}
