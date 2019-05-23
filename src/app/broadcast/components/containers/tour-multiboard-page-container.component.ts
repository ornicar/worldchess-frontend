import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { of } from 'rxjs';
import { pluck, switchMap, take } from 'rxjs/operators';
import { SubscriptionHelper, Subscriptions } from '../../../shared/helpers/subscription.helper';
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
      [isMultiboard]="true"
      >
    </wc-broadcast-page>
  `,
  styles: [` :host { display: block; }`]
})
export class TourMultiboardPageContainerComponent implements OnInit, OnDestroy {

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

  subs: Subscriptions = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tournamentLoad: TournamentLoadService,
    private eventLoad: EventLoadService
  ) { }

  ngOnInit() {
    this.subs.checkBoardsCount = this.route.data
      .subscribe(({tour, tournament}: IRouteData) => {
        if (tour.boards_count <= 1) {
          this.router.navigate(['/tournament', tournament.id, 'tour', tour.id]);
        }
      });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }
}
