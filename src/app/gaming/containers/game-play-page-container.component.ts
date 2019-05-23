import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Data  } from '@angular/router/src/config';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';
import { IBoard } from '../../broadcast/core/board/board.model';
import {  selectBoard } from '../../broadcast/core/board/board.reducer';
import { EventLoadService } from '../../broadcast/core/event/event-load.service';
import { IEvent } from '../../broadcast/core/event/event.model';
import { MatchLoadService } from '../../broadcast/core/match/match-load.service';
import { IMatch } from '../../broadcast/core/match/match.model';
import { TourLoadService } from '../../broadcast/core/tour/tour-load.service';
import { ITour } from '../../broadcast/core/tour/tour.model';
import { OnlineTournament } from '../../broadcast/core/tournament/tournament.model';
import * as fromRoot from '../../reducers';

interface IRouteData extends Data {
  tournament: OnlineTournament;
  board: IBoard;
}

@Component({
  selector: 'wc-game-play-page-container',
  template: `
    <wc-game-page
      [event]="event$ | async"
      [tournament]="tournament$ | async"
      [tour]="tour$ | async"
      [match]="match$ | async"
      [board]="board$ | async"
      >
    </wc-game-page>
  `,
  styles: [` :host { display: block; }`]
})
export class GamePlayPageContainerComponent implements OnInit {

  private selectBoard = selectBoard();

  public tournament$: Observable<OnlineTournament> = this.route.data.pipe(
    pluck<IRouteData, OnlineTournament>('tournament')
  );

  public board$: Observable<IBoard> = this.route.data.pipe(
    pluck<IRouteData, IBoard>('board'),
    switchMap(board => board
      ? this.store$.pipe(select(this.selectBoard, {boardId: board.id}))
      : of(null)
    ),
  );

  public event$: Observable<IEvent> = this.tournament$.pipe(
    switchMap(({event: eventId}) => eventId
      ? this.eventLoad.getWhenLacking(eventId)
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
    private store$: Store<fromRoot.State>,
    private eventLoad: EventLoadService,
    private tourLoad: TourLoadService,
    private matchLoad: MatchLoadService
  ) { }

  ngOnInit() {
  }

}
