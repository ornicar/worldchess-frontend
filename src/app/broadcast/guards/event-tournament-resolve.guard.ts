import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { EventResourceService } from '../core/event/event-resource.service';
import { TournamentLoadService } from '../core/tournament/tournament-load.service';
import { CommonTournament } from '../core/tournament/tournament.model';

@Injectable()
export class EventTournamentResolveGuard implements Resolve<CommonTournament> {
  constructor(
    private eventResource: EventResourceService,
    private tournamentLoad: TournamentLoadService
  ) { }

  resolve(routeSnapshot: ActivatedRouteSnapshot): Observable<CommonTournament> {
    const eventSlug = routeSnapshot.params['event-name'];

    return this.eventResource.getWithDefaultsBySlug(eventSlug).pipe(
      map(({defaults}) => defaults && defaults.tournament_id),
      tap(tournamentId => {
        if (!tournamentId) {
          throw new Error('Can not open this event.');
        }
      }),
      switchMap(tournamentId => this.tournamentLoad.getWhenLacking(tournamentId))
    );
  }
}
