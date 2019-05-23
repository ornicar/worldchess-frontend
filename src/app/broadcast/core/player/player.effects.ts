import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {PlayerResourceService} from './player-resource.service';
import {GetPlayers, LoadPlayers, PlayerActionTypes, GetPlayersById, LoadPlayersById} from './player.actions';


@Injectable()
export class PlayerEffects {

  constructor(
    private actions$: Actions,
    private playerResource: PlayerResourceService) {}

  @Effect()
  players$: Observable<Action> = this.actions$.pipe(
    ofType<GetPlayers>(PlayerActionTypes.GetPlayers),
    switchMap(() =>
      this.playerResource.getAll().pipe(
        map(players => new LoadPlayers({ players }))
      )
    )
  );

  @Effect()
  playersById$: Observable<Action> = this.actions$.pipe(
    ofType<GetPlayersById>(PlayerActionTypes.GetPlayersById),
    switchMap((action) =>
      this.playerResource.getMany(action.payload.ids).pipe(
        map(players => new LoadPlayersById({ players }))
      )
    )
  );
}
