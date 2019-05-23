import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {mapTo, switchMap, tap} from 'rxjs/operators';
import * as fromRoot from '../../reducers/index';
import {MatchLoadService} from '../core/match/match-load.service';
import {IMatch} from '../core/match/match.model';
import {TourLoadService} from '../core/tour/tour-load.service';

@Injectable()
export class MatchResolveGuard implements Resolve<IMatch> {
  constructor(
    private store: Store<fromRoot.State>,
    private router: Router,
    private matchLoad: MatchLoadService,
    private tourLoad: TourLoadService) {
  }

  resolve(routeSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IMatch> {
    const matchId = parseInt(routeSnapshot.params['match'], 10);
    const tournamentId = parseInt(routeSnapshot.parent.params['tournament'], 10);

    return this.matchLoad.getWhenLacking(matchId).pipe(
      switchMap(match => {
        // Check that the match relate to the tournament.
        return this.tourLoad.getWhenLacking(match.tour).pipe(
          tap(tour => {
            if (tour.tournament !== tournamentId) {
              throw new Error('invalid board');
            }
          }),
          mapTo(match)
        );
      })
    );
  }
}
