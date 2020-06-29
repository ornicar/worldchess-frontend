import { Component, HostBinding, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { HeaderModelType, ISelectedModel } from '../../../broadcast/components/header/header.component';
import { BoardLoadService } from '../../../broadcast/core/board/board-load.service';
import { IBoard } from '../../../broadcast/core/board/board.model';
import { GetCountries } from '../../../broadcast/core/country/country.actions';
import { EventLoadService } from '../../../broadcast/core/event/event-load.service';
import { IEvent } from '../../../broadcast/core/event/event.model';
import { MatchLoadService } from '../../../broadcast/core/match/match-load.service';
import { IMatch } from '../../../broadcast/core/match/match.model';
import { GetTeamsByTournamentId } from '../../../broadcast/core/team/team.actions';
import { TourLoadService } from '../../../broadcast/core/tour/tour-load.service';
import { ITour } from '../../../broadcast/core/tour/tour.model';
import { TournamentLoadService } from '../../../broadcast/core/tournament/tournament-load.service';
import { ClearSelectedTournament, SetSelectedTournament } from '../../../broadcast/core/tournament/tournament.actions';
import { Tournament } from '../../../broadcast/core/tournament/tournament.model';
import * as fromRoot from '../../../reducers';
import { OnChangesInputObservable, OnChangesObservable } from '../../../shared/decorators/observable-input';
import { SubscriptionHelper, Subscriptions } from '../../../shared/helpers/subscription.helper';

@Component({
  selector: 'wcd-widget-page',
  templateUrl: './widget-page.component.html',
  styles: [` :host {
    display: block;
  }`]
})
export class WidgetPageComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  event?: IEvent;

  @Input()
  tournament: Tournament;

  @Input()
  tour?: ITour;

  @Input()
  match?: IMatch;

  @Input()
  board?: IBoard;

  @OnChangesInputObservable()
  tournament$ = new BehaviorSubject<Tournament>(this.tournament);

  @Input()
  withoutBoard: boolean;

  @Input()
  isReadOnly = false;

  private subs: Subscriptions = {};

  @HostBinding('class')
  componentClass = 'wc-tournament wrapper';

  constructor(
    private router: Router,
    private store$: Store<fromRoot.State>,
    private activatedRoute: ActivatedRoute,
    private eventLoad: EventLoadService,
    private tournamentLoad: TournamentLoadService,
    private tourLoad: TourLoadService,
    private matchLoad: MatchLoadService,
    private boardLoad: BoardLoadService
  ) {
  }

  ngOnInit() {
    // Load all countries.
    this.store$.dispatch(new GetCountries());

    // Load all teams of current tournament.
    this.subs.getTeamsWhenSelectedTournament = this.tournament$.pipe(pluck<Tournament, number>('id'))
      .subscribe(tournamentId => {
        this.store$.dispatch(new SetSelectedTournament({id: tournamentId}));
        this.store$.dispatch(new GetTeamsByTournamentId({id: tournamentId}));
      });
  }

  @OnChangesObservable()
  ngOnChanges() {
  }

  async onChangeNavigation(item: ISelectedModel) {
    const gtag = window['gtag'];
    if (gtag) {
      gtag('event', 'navigation', {
        event_category: 'widget',
        event_label: this.tournament.title,
      });
    }

    switch (item.type) {

      case HeaderModelType.Tour: {
        const tour = item.model;
        let match, board;

        // load match and pairing.
        const defaults = await this.tourLoad.getDefaults(item.model.id).toPromise();

        if (defaults.match_id) {
          match = await this.matchLoad.getWhenLacking(defaults.match_id).toPromise();
        }

        // @todo parallel loading board and match.
        if (defaults.board_id) {
          board = await this.boardLoad.getWithExpandAllWhenLacking(defaults.board_id).toPromise();
        }

        this.tour = tour;
        this.match = match || null;
        this.board = board || null;
        this.withoutBoard = !board;

        break;
      }

      case HeaderModelType.Match: {
        const match = item.model;
        let board;

        // load match and pairing.
        const defaults = await this.matchLoad.getDefaults(item.model.id).toPromise();

        if (defaults.board_id) {
          board = await this.boardLoad.getWithExpandAllWhenLacking(defaults.board_id).toPromise();
        }

        this.match = match;
        this.board = board || null;
        this.withoutBoard = !board;

        break;
      }

      case HeaderModelType.Board: {
        this.board = item.model;
        this.withoutBoard = false;

        break;
      }
    }
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);

    this.store$.dispatch(new ClearSelectedTournament());
  }
}
