import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {PlayerRatingResourceService} from './player-rating-resource.service';
import {GetRatings, LoadRatings, PlayerRatingActionTypes} from './player-rating.actions';


@Injectable()
export class PlayerRatingEffects {

  constructor(
    private actions$: Actions,
    private playerResource: PlayerRatingResourceService,
  ) {}

  @Effect()
  getRatings$: Observable<Action> = this.actions$.pipe(
    ofType<GetRatings>(PlayerRatingActionTypes.GetRatings),
    switchMap(() =>
      this.playerResource.getAll().pipe(
        map(playerRatings => new LoadRatings({playerRatings}))
      )
    )
  );
}
