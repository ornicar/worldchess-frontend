import {Injectable} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {switchMap, take, tap} from 'rxjs/operators';
import {PlayerResourceService} from './player-resource.service';
import * as PlayerActions from './player.actions';
import {IPlayer} from './player.model';
import * as fromPlayer from './player.reducer';

@Injectable()
export class PlayerLoadService {

  constructor(
    private store$: Store<fromPlayer.State>,
    private playerResource: PlayerResourceService) { }

  /**
   * Load from store or server.
   */
  getWhenLacking(id: number): Observable<IPlayer> {
    return this.store$.pipe(
      select(fromPlayer.selectEntities),
      take(1),
      switchMap(entities => entities[id]
        ? of(entities[id])
        : this.playerResource.get(id).pipe(
          tap((player: IPlayer) => this.store$.dispatch(new PlayerActions.AddPlayer({ player }))),
        )
      )
    );
  }
}
