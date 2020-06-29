import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { TournamentLoadService } from '../core/tournament/tournament-load.service';
import { CommonTournament } from '../core/tournament/tournament.model';
import * as fromTournament from '../core/tournament/tournament.reducer';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';

@Injectable()
export class FideTournamentResolveGuard implements Resolve<CommonTournament> {
  constructor(
    private router: Router,
    private store: Store<fromTournament.State>,
    private tournamentLoad: TournamentLoadService,
  ) {
  }

  resolve(routeSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CommonTournament> {
    const tournamentId = parseInt(routeSnapshot.params['tournament'], 10);
    if (!isNaN(tournamentId)) {
      return this.tournamentLoad.loadWithSave(tournamentId).pipe(
        map((tournament) => {
          return state.url.replace(
            routeSnapshot.routeConfig.path.replace(':tournament', routeSnapshot.params['tournament']),
            routeSnapshot.routeConfig.path.replace(':tournament', tournament.slug),
          );
        }),
        mergeMap((url) => {
          return fromPromise(this.router.navigateByUrl(url)).pipe(map(() => null));
        }),
      );
    }
    return this.tournamentLoad.loadWithSaveBySlug(routeSnapshot.params['tournament'])
               .pipe(catchError((err, caught: Observable<CommonTournament>) => {
                 if (err) {
                   console.error(err);
                   return fromPromise(this.router.navigateByUrl('/not-found')).pipe(map(() => null));
                 }
               }));
  }
}
