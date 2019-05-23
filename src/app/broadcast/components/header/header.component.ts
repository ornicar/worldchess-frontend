import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { createSelector, select, Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, EMPTY, Observable, of } from 'rxjs';
import { delay, filter, map, switchMap, throttleTime } from 'rxjs/operators';
import * as fromRoot from '../../../reducers/index';
import { OnChangesInputObservable, OnChangesObservable } from '../../../shared/decorators/observable-input';
import { SubscriptionHelper, Subscriptions } from '../../../shared/helpers/subscription.helper';
import { GetBoardsByTour } from '../../core/board/board.actions';
import { IBoard} from '../../core/board/board.model';
import * as fromBoards from '../../core/board/board.reducer';
import { getPlayersIdsByBoard, selectBoard } from '../../core/board/board.reducer';
import { ICountry } from '../../core/country/country.model';
import { selectCountriesByIds } from '../../core/country/country.reducer';
import * as EventActions from '../../core/event/event.actions';
import { IEvent, EventOrganizer } from '../../core/event/event.model';
import * as fromEvent from '../../core/event/event.reducer';
import { GetMatchesByTour } from '../../core/match/match.actions';
import { IMatch} from '../../core/match/match.model';
import * as fromMatch from '../../core/match/match.reducer';
import { IPlayer } from '../../core/player/player.model';
import { selectPlayersByIds } from '../../core/player/player.reducer';
import { GetToursByTournament } from '../../core/tour/tour.actions';
import { ITour } from '../../core/tour/tour.model';
import * as fromTour from '../../core/tour/tour.reducer';
import { GetTournaments } from '../../core/tournament/tournament.actions';
import { Tournament, TournamentType } from '../../core/tournament/tournament.model';
import * as fromTournament from '../../core/tournament/tournament.reducer';
import * as fromTeam from '../../core/team/team.reducer';

export enum HeaderModelType {
  Cycle = 'cycle',
  Tournament = 'tournament',
  Tour = 'tour',
  Match = 'match',
  Board = 'Board'
}

export interface ISelectedEvent {
  type: HeaderModelType.Cycle;
  forMultiboard: boolean;
  model: IEvent;
}

export interface ISelectedTournament {
  type: HeaderModelType.Tournament;
  forMultiboard: boolean;
  model: Tournament;
}

export interface ISelectedTour {
  type: HeaderModelType.Tour;
  forMultiboard: boolean;
  model: ITour;
}

export interface ISelectedMatch {
  type: HeaderModelType.Match;
  forMultiboard: boolean;
  model: IMatch;
}

export interface ISelectedBoard {
  type: HeaderModelType.Board;
  model: IBoard;
}

export type ISelectedModel =
  ISelectedEvent
  | ISelectedTournament
  | ISelectedTour
  | ISelectedMatch
  | ISelectedBoard;

export const selectTournamentsByEvent = createSelector(
  fromTournament.selectAllTournament,
  (tournaments, {eventId}) => tournaments.filter(tournament => 'event' in tournament && tournament.event === eventId)
);

export const selectToursByTournament = createSelector(
  fromTour.selectAll,
  (tours, {tournamentId}) => tours.filter(tour => tour.tournament === tournamentId)
);

export const selectMatchesByTour = createSelector(
  fromMatch.selectAll,
  (matches, {tourId}) => matches.filter(match => match.tour === tourId)
);

export const selectBoardsByTour = createSelector(
  fromBoards.selectAll,
  (boards, { tourId }) => boards.filter(board => board.tour === tourId)
);

export const selectBoardsByMatch = createSelector(
  fromBoards.selectAll,
  (boards, { matchId }) => boards.filter(board => board.match === matchId)
);

@Component({
  selector: 'wc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  isMultiboard = false;

  @OnChangesInputObservable('isMultiboard')
  public isMultiboard$ = new BehaviorSubject<boolean>(this.isMultiboard);

  @Input()
  private event?: IEvent;

  @OnChangesInputObservable('event')
  public selectedEvent$ = new BehaviorSubject<IEvent>(this.event);

  @Input()
  public tournament: Tournament;

  @OnChangesInputObservable('tournament')
  public selectedTournament$ = new BehaviorSubject<Tournament>(this.tournament);

  @Input()
  public tour?: ITour;

  @OnChangesInputObservable('tour')
  public selectedTour$ = new BehaviorSubject<ITour>(this.tour);

  @Input()
  private match?: IMatch;

  @OnChangesInputObservable('match')
  public selectedMatch$ = new BehaviorSubject<IMatch>(this.match);

  @Input()
  private board?: IBoard;

  @OnChangesInputObservable('board')
  private board$ = new BehaviorSubject<IBoard>(this.board);

  @Input()
  public isReadOnly: boolean;

  public selectedBoard$ = this.isMultiboard$.pipe(
    switchMap(isMultiboard => isMultiboard
      ? of(null)
      : this.board$
    )
  );

  @Output()
  private selectedItemChange = new EventEmitter<ISelectedModel>();

  private selectPlayersByIds = selectPlayersByIds();
  private selectCountriesByIds = selectCountriesByIds();

  tournamentTypeIsMatch$ = this.selectedTournament$.pipe(
    map(tournament => tournament && tournament.tournament_type === TournamentType.MATCH)
  );

  // hide when event not selected.
  events$ = this.selectedEvent$.pipe(
    switchMap(selectedEvent => selectedEvent
      ? this.store$.pipe(select(fromEvent.selectAll)).pipe(
        map((events) => {
          if (!selectedEvent || selectedEvent.organized_by !== EventOrganizer.FIDE) {
            return events;
          }
          return events.filter(event => event.organized_by === EventOrganizer.FIDE);
        })
      )
      : of([])
    ),
    // @todo fix. ExpressionChangedAfterItHasBeenCheckedError
    throttleTime(10, undefined, { leading: true, trailing: true }),
  );

  tournaments$ = combineLatest(this.selectedEvent$, this.selectedTournament$).pipe(
    switchMap(([event, tournament]) => event
      ? this.store$.pipe(select(selectTournamentsByEvent, {eventId: event.id}))
      : of([tournament])
    ),
    // @todo fix. ExpressionChangedAfterItHasBeenCheckedError
    throttleTime(10, undefined, { leading: true, trailing: true }),
  );

  tours$ = this.selectedTournament$.pipe(
    switchMap(tournament => tournament
      ? this.store$.pipe(select(selectToursByTournament, {tournamentId: tournament.id}))
      : of([])
    ),
    // @todo fix. ExpressionChangedAfterItHasBeenCheckedError
    throttleTime(10, undefined, { leading: true, trailing: true }),
  );

  matches$ = this.tournamentTypeIsMatch$.pipe(
    switchMap(isMatch => isMatch
      ? this.selectedTour$.pipe(switchMap(tour => {
          return tour
            ? this.store$.pipe(select(selectMatchesByTour, {tourId: tour.id}))
            : of([]);
        }))
      : of([])
    ),
    // @todo fix. ExpressionChangedAfterItHasBeenCheckedError
    throttleTime(10, undefined, { leading: true, trailing: true }),
  );

  boards$ = this.tournamentTypeIsMatch$.pipe(
    switchMap(isMatch => isMatch
      ? this.selectedMatch$.pipe(switchMap(match => {
          return match
            ?  this.store$.pipe(select(selectBoardsByMatch, { matchId: match.id }))
            : of([]);
        }))
      : this.selectedTour$.pipe(switchMap(tour => {
          return tour
            ?  this.store$.pipe(select(selectBoardsByTour, { tourId: tour.id }))
            : of([]);
        }))
    ),
    // @todo fix. ExpressionChangedAfterItHasBeenCheckedError
    throttleTime(10, undefined, { leading: true, trailing: true }),
  );

  private boardsPlayers$: Observable<IPlayer[]> = this.boards$
    .pipe(
      switchMap(boards => this.store$.pipe(
        select(this.selectPlayersByIds, { playerIds: boards.reduce((ids, board) => ids.concat(getPlayersIdsByBoard(board)), []) }),
      ))
    );

  private boardsPlayersCountries$: Observable<ICountry[]> = this.boardsPlayers$
    .pipe(
      switchMap(players => this.store$.pipe(
        select(this.selectCountriesByIds, { countriesIds: players.map(player => player.federation) }),
      ))
    );

  private boardsPlayersCountries: ICountry[] = [];
  private boardsPlayers: IPlayer[] = [];

  updateProtect$ = combineLatest(
    this.selectedEvent$,
    this.selectedTournament$,
    this.selectedTour$,
    this.selectedMatch$,
  )
    .pipe(
      delay(1000),
    );

  private subs: Subscriptions = {};

  selectBoard = selectBoard();

  public teamsCount$ = this.store$.pipe(select(fromTeam.selectTotal));

  constructor(
    private cd: ChangeDetectorRef,
    private store$: Store<fromRoot.State>
  ) {
  }

  ngOnInit() {
    this.store$.dispatch(new EventActions.GetEventsWithTournaments());

    this.subs.getTournaments = this.selectedEvent$
      .pipe(
        map(event => event && event.id),
        filter(id => Boolean(id))
      )
      .subscribe(eventId =>
        this.store$.dispatch(new GetTournaments({ options: { event: eventId }}))
      );

    this.subs.getTours = this.selectedTournament$
      .pipe(
        map(tournament => tournament && tournament.id),
        filter(id => Boolean(id))
      )
      .subscribe(tournamentId =>
        this.store$.dispatch(new GetToursByTournament({ id: tournamentId }))
      );

    this.subs.getMatches = this.tournamentTypeIsMatch$
      .pipe(
        switchMap(isMatch => isMatch
          ? this.selectedTour$.pipe(map(tour => tour && tour.id))
          : EMPTY
        ),
        filter(id => Boolean(id))
      )
      .subscribe(tourId =>
        this.store$.dispatch(new GetMatchesByTour({ id: tourId }))
      );

    this.subs.getBoards = this.selectedTour$
      .pipe(
        map(tour => tour && tour.id),
        filter(id => Boolean(id))
      )
      .subscribe(tourId =>
        this.store$.dispatch(new GetBoardsByTour({ id: tourId }))
      );

    this.subs.boardsPlayers = this.boardsPlayers$.subscribe(players => {
      this.boardsPlayers = players;
      this.cd.markForCheck();
    });

    this.subs.boardsPlayersCountries = this.boardsPlayersCountries$.subscribe(boardsPlayersCountries => {
      this.boardsPlayersCountries = boardsPlayersCountries;
      this.cd.markForCheck();
    });
  }

  public canOpenMultiboard() {
    return this.tour && this.tour.boards_count > 1;
  }

  @OnChangesObservable()
  ngOnChanges() {}

  ngOnDestroy(): void {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  public getBoardAutocompleteFunction() {
    return (board: IBoard, filterString: string): boolean => {
      let isMatched = false;

      if (board.white_player) {
        const whitePlayer = this.boardsPlayers.find(player => player.fide_id === board.white_player);
        const whitePlayerCountry = this.boardsPlayersCountries.find(country => country.id === whitePlayer.federation);

        isMatched = isMatched
          || whitePlayer.full_name.toLowerCase().includes(filterString)
          || whitePlayerCountry.name.toLowerCase().includes(filterString);
      }

      if (board.black_player) {
        const blackPlayer = this.boardsPlayers.find(player => player.fide_id === board.black_player);
        const blackPlayerCountry = this.boardsPlayersCountries.find(country => country.id === blackPlayer.federation);

        isMatched = isMatched
          || blackPlayer.full_name.toLowerCase().includes(filterString)
          || blackPlayerCountry.name.toLowerCase().includes(filterString);
      }

      return isMatched;
    };
  }

  changeEvent(event: IEvent) {
    this.selectedItemChange.emit({
      type: HeaderModelType.Cycle,
      forMultiboard: this.isMultiboard,
      model: event
    });
  }

  changeTournament(tournament: Tournament) {
    this.selectedItemChange.emit({
      type: HeaderModelType.Tournament,
      forMultiboard: this.isMultiboard,
      model: tournament
    });
  }

  changeTour(tour: ITour) {
    this.selectedItemChange.emit({
      type: HeaderModelType.Tour,
      forMultiboard: this.isMultiboard,
      model: tour
    });
  }

  changeMatch(match: IMatch) {
    this.selectedItemChange.emit({
      type: HeaderModelType.Match,
      forMultiboard: this.isMultiboard,
      model: match
    });
  }

  changeBoard(board: IBoard) {
    this.selectedItemChange.emit({
      type: HeaderModelType.Board,
      model: board
    });
  }
}
