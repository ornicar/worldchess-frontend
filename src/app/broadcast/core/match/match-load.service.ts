import {Injectable} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {pluck, switchMap, take, tap} from 'rxjs/operators';
import {IDefaultEntities} from '../models/default-entities';
import {MatchResourceService} from './match-resource.service';
import * as MatchActions from './match.actions';
import {IMatch} from './match.model';
import * as fromMatch from './match.reducer';

@Injectable()
export class MatchLoadService {

  constructor(
    private store$: Store<fromMatch.State>,
    private matchResource: MatchResourceService) { }

  /**
   * Load from store or server.
   */
  getWhenLacking(id: number): Observable<IMatch> {
    return this.store$.pipe(
      select(fromMatch.selectEntities),
      take(1),
      switchMap(entities => entities[id]
        ? of(entities[id])
        : this.matchResource.getWithDefaults(id).pipe(
          pluck('match'),
          tap((match: IMatch) => this.store$.dispatch(new MatchActions.AddMatch({ match }))),
        )
      )
    );
  }

  getDefaults(id: number): Observable<IDefaultEntities> {
    return this.store$.pipe(
      select(fromMatch.selectMatchesDefaultEntities),
      take(1),
      switchMap(defaultEntities => defaultEntities[id]
        ? of(defaultEntities[id])
        : this.matchResource.getWithDefaults(id).pipe(
          pluck('defaults'),
          tap(defaults => this.store$.dispatch(new MatchActions.AddMatchDefaultEntities({ id, defaults })))
        )
      )
    );
  }
}
