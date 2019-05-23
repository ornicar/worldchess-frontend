import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { TeamPlayerResourceService } from './team-players-resource.service';
import {
  LoadSelectedTeamPlayers,
  TeamPlayersActionTypes,
  GetTeamPlayersWithParams,
  GetSelectedTeamPlayersWithParams,
  AddTeamPlayers
} from './team-players.actions';


@Injectable()
export class TeamPlayerEffects {

  constructor(
    private actions$: Actions,
    private teamPlayersResource: TeamPlayerResourceService
  ) { }

  @Effect()
  getTeamPlayersWithParams$: Observable<Action> = this.actions$.pipe(
    ofType<GetTeamPlayersWithParams>(TeamPlayersActionTypes.GetTeamPlayersWithParams),
    switchMap(action => {
      return this.teamPlayersResource
        .getWithParams(action.payload.params).pipe(
          map(response => {
            const { results, count } = response;
            return new AddTeamPlayers({ teamPlayers: results, count });
          })
        );
    })
  );

  @Effect()
  getSelectedTeamPlayersWithParams$: Observable<Action> = this.actions$.pipe(
    ofType<GetSelectedTeamPlayersWithParams>(TeamPlayersActionTypes.GetSelectedTeamPlayersWithParams),
    switchMap(action => {
      return this.teamPlayersResource
        .getWithParams(action.payload.params).pipe(
          map(response => {
            const { results } = response;
            return new LoadSelectedTeamPlayers({ teamPlayers: results });
          })
        );
    })
  );
}
