import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { createSelector, select, Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { delay, filter, map, switchMap, throttleTime } from 'rxjs/operators';
import * as fromRoot from '../../../reducers/index';
import { OnChangesInputObservable, OnChangesObservable } from '../../../shared/decorators/observable-input';
import { SubscriptionHelper, Subscriptions } from '../../../shared/helpers/subscription.helper';
import { EventOrganizer, IEvent } from '../../core/event/event.model';
import { Tournament } from '../../core/tournament/tournament.model';
import { sortByStartStateAndDate } from '../../core/tournament/tournament.reducer';
import * as fromTournament from '../../core/tournament/tournament.reducer';
import { HeaderModelType, ISelectedEvent, ISelectedTournament } from './header.component';
import * as fromHeader from './header.reducer';
import * as HeaderActions from './header.actions';

export type ISelectedModel = ISelectedEvent | ISelectedTournament;

export const selectTournamentsByEvent = createSelector(
  fromTournament.selectAllTournament,
  (tournaments, {eventId}) => tournaments.filter(tournament => 'event' in tournament && tournament.event === eventId)
);

@Component({
  selector: 'wc-header-small',
  templateUrl: './header-small.component.html',
  styleUrls: ['./header-small.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderSmallComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  private event: IEvent;

  @OnChangesInputObservable('event')
  private selectedEvent$ = new BehaviorSubject<IEvent>(this.event);

  @Input()
  private tournament: Tournament;

  @OnChangesInputObservable('tournament')
  private selectedTournament$ = new BehaviorSubject<Tournament>(this.tournament);

  @Output()
  private selectedItemChange = new EventEmitter<ISelectedModel>();

  @Input()
  enableTournamentDropdown = true;

  // hide when event not selected.
  events$ = this.selectedEvent$.pipe(
    switchMap(event => event
      ? this.store$.pipe(
          select(fromHeader.selectAllEvents),
          map(events => events.filter(e => e.organized_by === EventOrganizer.FIDE)),
        )
      : of([])
    ),
    // @todo fix. ExpressionChangedAfterItHasBeenCheckedError
    throttleTime(10, undefined, { leading: true, trailing: true }),
  );

  tournaments$ = this.store$.pipe(
    select(fromHeader.selectAllTournaments),
    map(entities => entities.sort(sortByStartStateAndDate)),
    throttleTime(10, undefined, { leading: true, trailing: true }),
  );
  // tournaments$ = this.selectedEvent$.pipe(
  //   switchMap(event => event
  //     ? this.store$.pipe(
  //         select(selectTournamentsByEvent, {eventId: event.id}),
  //         map(tournaments => tournaments.filter(t => t.organized_by === EventOrganizer.FIDE))
  //       )
  //     : of([])
  //   ),
  //   map(entities => entities.sort(sortByStartStateAndDate)),
  //   // @todo fix. ExpressionChangedAfterItHasBeenCheckedError
  //   throttleTime(10, undefined, { leading: true, trailing: true }),
  // );

  private subs: Subscriptions = {};

  updateProtect$ = combineLatest(
    this.selectedEvent$,
    this.selectedTournament$
  )
    .pipe(
      delay(1000),
    );

  constructor(private store$: Store<fromRoot.State>) {
  }

  ngOnInit() {
    this.store$.dispatch(new HeaderActions.GetEvents());

    this.subs.getTournaments = this.selectedEvent$
      .pipe(
        map(event => event && event.id),
        filter(id => Boolean(id))
      )
      .subscribe(eventId =>
        this.store$.dispatch(new HeaderActions.GetTournaments({ options: { event: eventId, fide: 'True' } }))
      );
  }

  @OnChangesObservable()
  ngOnChanges() {}

  ngOnDestroy(): void {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  changeEvent(event: IEvent) {
    this.selectedItemChange.emit({
      type: HeaderModelType.Cycle,
      forMultiboard: false,
      model: event
    });
  }

  changeTournament(tournament: Tournament) {
    this.selectedItemChange.emit({
      type: HeaderModelType.Tournament,
      forMultiboard: false,
      model: tournament
    });
  }
}
