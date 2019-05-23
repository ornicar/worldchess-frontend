import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TournamentLoadService } from '../core/tournament/tournament-load.service';
import { CommonTournament } from '../core/tournament/tournament.model';
import * as fromTournament from '../core/tournament/tournament.reducer';

@Injectable()
export class FideTournamentResolveGuard implements Resolve<CommonTournament> {
  constructor(
    private router: Router,
    private store: Store<fromTournament.State>,
    private tournamentLoad: TournamentLoadService
  ) { }

  resolve(routeSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CommonTournament> {
    const tournamentId = parseInt(routeSnapshot.params['tournament'], 10);
    if (!isNaN(tournamentId)) {
      return this.tournamentLoad.loadWithSave(tournamentId);
    } else {
      return this.tournamentLoad.loadWithSaveBySlug(routeSnapshot.params['tournament']);
    }
  }
}
