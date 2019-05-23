import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { of } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';
import { EventLoadService } from '../../core/event/event-load.service';
import { ITour } from '../../core/tour/tour.model';
import { TournamentLoadService } from '../../core/tournament/tournament-load.service';
import { Tournament } from '../../core/tournament/tournament.model';

interface IRouteData extends Data {
  tournament: Tournament;
  tour: ITour;
}

@Component({
  selector: 'wc-tour-page-container',
  template: `
    <wc-broadcast-page
      [event]="event$ | async"
      [tournament]="tournament$ | async"
      [tour]="tour$ | async"
      >
    </wc-broadcast-page>
  `,
  styles: [` :host { display: block; }`]
})
export class TourPageContainerComponent implements OnInit {

  public tournament$ = this.route.data.pipe(
    pluck<IRouteData, Tournament>('tournament')
  );

  public tour$ = this.route.data.pipe(
    pluck<IRouteData, ITour>('tour')
  );

  public event$ = this.tournament$.pipe(
    switchMap(tournament => 'event' in tournament && tournament.event
      ? this.eventLoad.getWhenLacking(tournament.event)
      : of(null)
    )
  );

  constructor(
    private route: ActivatedRoute,
    private tournamentLoad: TournamentLoadService,
    private eventLoad: EventLoadService
  ) { }

  ngOnInit() {
  }

}
