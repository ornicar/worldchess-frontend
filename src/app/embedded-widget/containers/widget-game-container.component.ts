import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Observable, of } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';
import { IBoard } from '../../broadcast/core/board/board.model';
import { EventLoadService } from '../../broadcast/core/event/event-load.service';
import { MatchLoadService } from '../../broadcast/core/match/match-load.service';
import { IMatch } from '../../broadcast/core/match/match.model';
import { TourLoadService } from '../../broadcast/core/tour/tour-load.service';
import { ITour } from '../../broadcast/core/tour/tour.model';
import { Tournament } from '../../broadcast/core/tournament/tournament.model';

interface IRouteData extends Data {
  tournament: Tournament;
  board: IBoard;
}

@Component({
  selector: 'wcd-widget-game-container',
  template: `
    <wcd-widget-page
      [event]="event$ | async"
      [tournament]="tournament$ | async"
      [tour]="tour$ | async"
      [match]="match$ | async"
      [board]="board$ | async"
      [isReadOnly]="true"
    >
    </wcd-widget-page>
  `,
  styles: [` :host {
    display: block;
  }`]
})
export class WidgetGameContainerComponent implements OnInit {

  public tournament$: Observable<Tournament> = this.route.data.pipe(
    pluck<IRouteData, Tournament>('tournament')
  );

  public board$: Observable<IBoard> = this.route.data.pipe(
    pluck<IRouteData, IBoard>('board')
  );

  public event$ = this.tournament$.pipe(
    switchMap(tournament => 'event' in tournament && tournament.event
      ? this.eventLoad.getWhenLacking(tournament.event)
      : of(null)
    )
  );

  public tour$: Observable<ITour> = this.board$.pipe(
    switchMap(({tour: tourId}) => tourId
      ? this.tourLoad.getWhenLacking(tourId)
      : of(null)
    )
  );

  public match$: Observable<IMatch> = this.board$.pipe(
    switchMap(({match: matchId}) => matchId
      ? this.matchLoad.getWhenLacking(matchId)
      : of(null)
    )
  );

  constructor(
    private route: ActivatedRoute,
    private eventLoad: EventLoadService,
    private tourLoad: TourLoadService,
    private matchLoad: MatchLoadService
  ) {
  }

  ngOnInit() {
  }

}
