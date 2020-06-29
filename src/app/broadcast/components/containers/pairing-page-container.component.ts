import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Observable, of } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';
import { IBoard } from '../../core/board/board.model';
import { EventLoadService } from '../../core/event/event-load.service';
import { MatchLoadService } from '../../core/match/match-load.service';
import { IMatch } from '../../core/match/match.model';
import { TourLoadService } from '../../core/tour/tour-load.service';
import { ITour } from '../../core/tour/tour.model';
import { Tournament } from '../../core/tournament/tournament.model';

interface IRouteData extends Data {
  tournament: Tournament;
  board: IBoard;
}

@Component({
  selector: 'wc-board-page-container',
  template: `
    <wc-broadcast-page
      [event]="event$ | async"
      [tournament]="tournament$ | async"
      [tour]="tour$ | async"
      [match]="match$ | async"
      [board]="board$ | async"
      >
    </wc-broadcast-page>
  `,
  styles: [` :host { display: block; }`]
})
export class BoardPageContainerComponent implements OnInit {

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
  ) { }

  ngOnInit() {
  }

}
