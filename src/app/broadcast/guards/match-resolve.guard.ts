import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {Store} from '@ngrx/store';
import { Observable } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as fromRoot from '../../reducers/index';
import {MatchLoadService} from '../core/match/match-load.service';
import { IMatch } from '../core/match/match.model';
import { fromPromise } from 'rxjs/internal-compatibility';
import { ITour } from '@app/broadcast/core/tour/tour.model';

@Injectable()
export class MatchResolveGuard implements Resolve<IMatch> {
  constructor(
    private store: Store<fromRoot.State>,
    private router: Router,
    private matchLoad: MatchLoadService,
  ) {
  }

  resolve(routeSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IMatch> {
    const matchId = parseInt(routeSnapshot.params['match'], 10);

    return this.matchLoad.getWhenLacking(matchId).pipe(
      mergeMap(match => {
        return this.matchLoad.getDefaults(match.id).pipe(
          map((def) => {
            function replace(parts: Array<String | Number>): string {
              return state.url.replace(
                routeSnapshot.routeConfig.path.replace(':match', routeSnapshot.params['match']),
                parts.join('/'),
              );
            }
            if (def.board_id) {
              return replace(['pairing', def.board_id]);
            } else if (def.tour_id) {
              return replace(['tour', def.tour_id]);
            } else if (def.tournament_id) {
              return replace(['tournament', def.tournament_id]);
            } else if (def.event_id) {
              return replace(['event', def.tournament_id]);
            } else {
              throw new Error(`No default for mathch`);
            }
          }),
          mergeMap((url) => {
            return fromPromise(this.router.navigateByUrl(url)).pipe(map(() => null));
          }),
          catchError((err, caught: Observable<ITour>) => {
            if (err) {
              console.error(err);
              return fromPromise(this.router.navigateByUrl('/not-found')).pipe(map(() => null));
            }
          })
        );
      })
    );
  }
}
