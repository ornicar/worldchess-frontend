import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as fromRoot from '../../reducers/index';
import { TourLoadService } from '../core/tour/tour-load.service';
import { ITour } from '../core/tour/tour.model';
import { Tournament } from '@app/broadcast/core/tournament/tournament.model';
import { TourResourceService } from '@app/broadcast/core/tour/tour-resource.service';
import { fromPromise } from 'rxjs/internal-compatibility';

@Injectable()
export class TourResolveGuard implements Resolve<ITour> {
  constructor(
    private store: Store<fromRoot.State>,
    private router: Router,
    private tourLoad: TourLoadService,
    private tourResourceService: TourResourceService,
  ) {
  }

  getTourSlug(tour: ITour): string {
    return [
      tour.tour_number,
      (tour.tour_round_name || '').replace(/\s/g, '-'),
    ].filter(n => !!n).join('.');
  }

  resolve(routeSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ITour> {
    const tourId = parseInt(routeSnapshot.params['tour'], 10);
    const tourNumber = routeSnapshot.params['tourNumber'];
    const tournament: Tournament = routeSnapshot.parent.data['tournament'];

    let observable: Observable<ITour>;

    if (tourId && !isNaN(tourId)) {
      observable = this.tourLoad.getWhenLacking(tourId).pipe(
        map(tour => {
          return state.url.replace(
            routeSnapshot.routeConfig.path.replace(':tour', routeSnapshot.params['tour']),
            this.getTourSlug(tour),
          );
        }),
        mergeMap((url) => {
          return fromPromise(this.router.navigateByUrl(url)).pipe(map(() => null));
        }),
      );
    } else if (tourNumber) {
      observable = this.tourResourceService.getByTournament(tournament.id).pipe(
        mergeMap((tours: ITour[]) => {
          const tour = tours.find(t => this.getTourSlug(t) === tourNumber);
          return tour ? of(tour) : throwError(`Not found tour by slug ${tourNumber}`);
        }),
      );
    } else {
      observable = fromPromise(this.router.navigateByUrl('/not-found')).pipe(map(() => null));
    }
    return observable.pipe(catchError((err, caught: Observable<ITour>) => {
      if (err) {
        console.error(err);
        return fromPromise(this.router.navigateByUrl('/not-found')).pipe(map(() => null));
      }
    }));
  }
}
