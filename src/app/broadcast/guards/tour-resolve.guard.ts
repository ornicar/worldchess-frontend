import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import * as fromRoot from '../../reducers/index';
import {TourLoadService} from '../core/tour/tour-load.service';
import {ITour} from '../core/tour/tour.model';

@Injectable()
export class TourResolveGuard implements Resolve<ITour> {
  constructor(
    private store: Store<fromRoot.State>,
    private router: Router,
    private tourLoad: TourLoadService) {
  }

  resolve(routeSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ITour> {
    const tourId = parseInt(routeSnapshot.params['tour'], 10);
    const tournamentId = parseInt(routeSnapshot.parent.params['tournament'], 10);

    return this.tourLoad.getWhenLacking(tourId).pipe(
      // Check that the tour relate to the tournament.
      tap(tour => {
        if (tour.tournament !== tournamentId) {
          throw new Error('invalid board');
        }
      })
    );
  }
}
