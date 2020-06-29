import { Component, HostBinding, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { selectIsAuthorized } from '@app/auth/auth.reducer';
import * as fromRoot from '../../../reducers/index';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { SubscriptionHelper, Subscriptions } from '@app/shared/helpers/subscription.helper';
import {
  selectChatInfoModalIsOpen,
  selectEmbeddedWidgetModalIsOpen,
} from '../../chess/chess-page/game/game.reducer';
import { IBoard } from '../../core/board/board.model';
import { GetCountries } from '../../core/country/country.actions';
import { EventLoadService } from '../../core/event/event-load.service';
import { EventOrganizer, IEvent } from '../../core/event/event.model';
import { MatchLoadService } from '../../core/match/match-load.service';
import { IMatch } from '../../core/match/match.model';
import { IDefaultEntities } from '../../core/models/default-entities';
import { GetTeamsByTournamentId } from '../../core/team/team.actions';
import { TourLoadService } from '../../core/tour/tour-load.service';
import { ITour } from '../../core/tour/tour.model';
import { TournamentLoadService } from '../../core/tournament/tournament-load.service';
import { ClearSelectedTournament, SetSelectedTournament } from '../../core/tournament/tournament.actions';
import { Tournament } from '../../core/tournament/tournament.model';
import { HeaderModelType, ISelectedModel } from '../header/header.component';
import { ScreenStateService } from '@app/shared/screen/screen-state.service';

@Component({
  selector: 'wc-broadcast-page',
  templateUrl: './broadcast-page.component.html',
  styleUrls: ['./broadcast-page.component.scss']
})
export class BroadcastPageComponent implements OnInit, OnChanges, OnDestroy {
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
  isMultiboard = false;

  @Input()
  withoutBoard: boolean;

  private subs: Subscriptions = {};

  @HostBinding('class') componentClass = 'wc-tournament wrapper';

  embeddedWidgetModalIsOpen$ = this.store$.pipe(
    select(selectEmbeddedWidgetModalIsOpen)
  );

  chatInfoModalIsOpen$ = this.store$.pipe(
    select(selectChatInfoModalIsOpen)
  );

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized)
  );

  constructor(
    private router: Router,
    private store$: Store<fromRoot.State>,
    private activatedRoute: ActivatedRoute,
    private eventLoad: EventLoadService,
    private tournamentLoad: TournamentLoadService,
    private tourLoad: TourLoadService,
    private matchLoad: MatchLoadService,
    private screenState: ScreenStateService,
  ) {
  }

  ngOnInit() {
    // Load all countries.
    this.store$.dispatch(new GetCountries());

    // Load all teams of current tournament.
    this.subs.getTeamsWhenSelectedTournament = this.tournament$.pipe(pluck<Tournament, number>('id'))
      .subscribe(tournamentId => {
        this.store$.dispatch(new SetSelectedTournament({ id: tournamentId }));
        this.store$.dispatch(new GetTeamsByTournamentId({ id: tournamentId }));
      });
  }

  @OnChangesObservable()
  ngOnChanges() {}

  async onChangeNavigation(item: ISelectedModel) {
    const routerCommands = [];

    const getTournamentPath = (organizer: EventOrganizer): string => {
      // TODO dich ebanaya
      return 'tournament';
    };

    const getNavCommandFromHeaderModels = (models: IDefaultEntities, organizer: EventOrganizer, forMultiboard: boolean)  => {
      const commands = [];

      if (models.tournament_id) {
        commands.push(`/${getTournamentPath(organizer)}`, models.tournament_id.toString());

        if (forMultiboard && models.tour_id) {
          commands.push('tour', models.tour_id.toString());
          commands.push('multiboard');
        } else if (models.board_id) {
          commands.push('pairing', models.board_id.toString());
        } else if (models.match_id) {
          commands.push('match', models.match_id.toString());
        } else if (models.tour_id) {
          commands.push('tour', models.tour_id.toString());
        }
      }

      return commands;
    };

    switch (item.type) {
      case HeaderModelType.Cycle: {
        const defaults = await this.eventLoad.getDefaults(item.model.id).toPromise();

        if (defaults) {
          routerCommands.push(...getNavCommandFromHeaderModels(defaults, item.model.organized_by, item.forMultiboard));
        }

        break;
      }

      case HeaderModelType.Tournament: {
        let defaults;

        defaults = await this.tournamentLoad.getDefaults(item.model.id).toPromise();

        // TODO wat?
        item.forMultiboard = false;
        /// TODO SOOOOOQAAAAAA
        // switch (item.model.organized_by) {
        //   case EventOrganizer.FIDE:
        //     defaults = await this.tournamentLoad.getDefaults(item.model.id).toPromise();
        //     break;
        //
        //   case EventOrganizer.FOUNDER:
        //     defaults = await this.tournamentLoad.getFounderTournamentDefaults(item.model.id).toPromise();
        //     break;
        //
        //   case EventOrganizer.ONLINE:
        //     defaults = await this.tournamentLoad.getOnlineTournamentDefaults(item.model.id).toPromise();
        //     break;
        // }

        if (!defaults) {
          defaults = { tournament_id: item.model.id };
        } else if (!defaults.tournament_id) {
          // TODO chto ya delayu???
          defaults.tournament_id = item.model.id;
        }

        routerCommands.push(...getNavCommandFromHeaderModels(defaults, item.model.organized_by, item.forMultiboard));

        break;
      }

      case HeaderModelType.Tour: {
        const models = {
          tournament_id: this.tournament.id,
          tour_id: item.model.id
        };

        let defaults: IDefaultEntities = models;

        if (!item.forMultiboard) {
          defaults = await this.tourLoad.getDefaults(item.model.id).toPromise();

          if (!defaults) {
            defaults = models;
          }
        }

        routerCommands.push(...getNavCommandFromHeaderModels(defaults, this.tournament.organized_by, item.forMultiboard));

        break;
      }

      case HeaderModelType.Match: {
        let defaults = await this.matchLoad.getDefaults(item.model.id).toPromise();

        if (!defaults) {
          defaults = {
            tournament_id: this.tournament.id,
            match_id: item.model.id
          };
        }

        routerCommands.push(...getNavCommandFromHeaderModels(defaults, this.tournament.organized_by, item.forMultiboard));

        break;
      }

      case HeaderModelType.Board: {
        routerCommands.push('tournament', this.tournament.id);
        routerCommands.push('pairing', item.model.id);

        break;
      }
    }

    if (routerCommands.length) {
      this.screenState.slideLeftBack();
      this.router.navigate(routerCommands);
    } else {
      console.error('Can not navigate.');
    }
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);

    this.store$.dispatch(new ClearSelectedTournament());
  }
}
