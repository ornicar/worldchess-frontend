import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';
import { BoardLoadService } from '../../core/board/board-load.service';
import { EventLoadService } from '../../core/event/event-load.service';
import { EventOrganizer } from '../../core/event/event.model';
import { MatchLoadService } from '../../core/match/match-load.service';
import { IDefaultEntities } from '../../core/models/default-entities';
import { TourLoadService } from '../../core/tour/tour-load.service';
import { TournamentLoadService } from '../../core/tournament/tournament-load.service';
import { Tournament } from '../../core/tournament/tournament.model';

interface IRouteData {
  tournament: Tournament;
}

@Component({
  selector: 'wc-tournament-page-container',
  template: `
    <wc-broadcast-page
      [event]="event$ | async"
      [tournament]="tournament$ | async"
      [tour]="tour$ | async"
      [match]="match$ | async"
      [board]="board$ | async"
      [withoutBoard]="withoutBoard$ | async"
      >
    </wc-broadcast-page>
  `,
  styles: [` :host { display: block; }`]
})
export class TournamentPageContainerComponent implements OnInit {

  public tournament$ = this.route.data.pipe(
    pluck<IRouteData, Tournament>('tournament')
  );

  public event$ = this.tournament$.pipe(
    switchMap(tournament => 'event' in tournament && tournament.event
      ? this.eventLoad.getWhenLacking(tournament.event)
      : of(null)
    )
  );

  private tournamentDefaults$ = this.tournament$.pipe(
    switchMap((tournament: Tournament) => {
      return this.tournamentLoad.getDefaults(tournament.id);
    }),
    map(defaults => defaults ? defaults : {}),
    shareReplay(1)
  );

  public tour$ = this.tournamentDefaults$.pipe(
    pluck<IDefaultEntities, number>('tour_id'),
    switchMap(tourId => tourId
      ? this.tourLoad.getWhenLacking(tourId)
      : of(null)
    )
  );

  public match$ = this.tournamentDefaults$.pipe(
    pluck<IDefaultEntities, number>('match_id'),
    switchMap(matchId => matchId
      ? this.matchLoad.getWhenLacking(matchId)
      : of(null)
    )
  );

  public board$ = this.tournamentDefaults$.pipe(
    pluck<IDefaultEntities, number>('board_id'),
    switchMap(boardId => boardId
      ? this.boardLoad.getWithExpandAllWhenLacking(boardId)
      : of(null)
    )
  );

  public withoutBoard$: Observable<Boolean> = this.tournamentDefaults$.pipe(
    pluck<IDefaultEntities, number>('board_id'),
    map(boardId => boardId === null || boardId === undefined)
  );

  constructor(
    private route: ActivatedRoute,
    private tournamentLoad: TournamentLoadService,
    private eventLoad: EventLoadService,
    private tourLoad: TourLoadService,
    private matchLoad: MatchLoadService,
    private boardLoad: BoardLoadService,
  ) { }

  ngOnInit() {
  }

}
