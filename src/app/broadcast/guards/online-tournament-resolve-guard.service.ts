import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TournamentLoadService } from '../core/tournament/tournament-load.service';
import { OnlineTournament } from '../core/tournament/tournament.model';
import * as fromTournament from '../core/tournament/tournament.reducer';

@Injectable()
export class OnlineTournamentResolveGuard implements Resolve<OnlineTournament> {
  constructor(
    private router: Router,
    private store: Store<fromTournament.State>,
    private tournamentLoad: TournamentLoadService
  ) { }

  resolve(routeSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OnlineTournament> {
    const tournamentId = parseInt(routeSnapshot.params['tournament'], 10);

    return this.tournamentLoad.loadWithSave(tournamentId).pipe(
      map(tournament => tournament as OnlineTournament)
    );
  }
}
