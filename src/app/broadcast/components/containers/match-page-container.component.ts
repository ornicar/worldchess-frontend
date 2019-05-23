import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';
import { EventLoadService } from '../../core/event/event-load.service';
import { IMatch } from '../../core/match/match.model';
import { TourLoadService } from '../../core/tour/tour-load.service';
import { TournamentLoadService } from '../../core/tournament/tournament-load.service';
import { Tournament } from '../../core/tournament/tournament.model';

interface IRouteData {
  tournament: Tournament;
  match: IMatch;
}

@Component({
  selector: 'wc-match-page-container',
  template: `
    <wc-broadcast-page
      [event]="event$ | async"
      [tournament]="tournament$ | async"
      [tour]="tour$ | async"
      [match]="match$ | async"
      >
    </wc-broadcast-page>
  `,
  styles: [` :host { display: block; }`]
})
export class MatchtPageContainerComponent implements OnInit {

  public tournament$ = this.route.data.pipe(
    pluck<IRouteData, Tournament>('tournament')
  );

  public match$ = this.route.data.pipe(
    pluck<IRouteData, IMatch>('match')
  );

  public event$ = this.tournament$.pipe(
    switchMap(tournament => 'event' in tournament && tournament.event
      ? this.eventLoad.getWhenLacking(tournament.event)
      : of(null)
    )
  );

  public tour$ = this.match$.pipe(
    switchMap(match => match.tour
      ? this.tourLoad.getWhenLacking(match.tour)
      : of(null)
    )
  );

  constructor(
    private route: ActivatedRoute,
    private tournamentLoad: TournamentLoadService,
    private eventLoad: EventLoadService,
    private tourLoad: TourLoadService
  ) { }

  ngOnInit() {
  }

}
