import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {TeamResourceService} from './team-resource.service';
import {LoadTeams, TeamActionTypes, GetTeamsByTournamentId} from './team.actions';


@Injectable()
export class TeamEffects {

  constructor(
    private actions$: Actions,
    private teamResource: TeamResourceService) {}

  @Effect()
  getTeamsByTournamentId$: Observable<Action> = this.actions$.pipe(
    ofType<GetTeamsByTournamentId>(TeamActionTypes.GetTeamsByTournamentId),
    switchMap(action => this.teamResource
      .getByTournamentId(action.payload.id)
      .pipe(map(teams => new LoadTeams({ teams })))
    )
  );
}
