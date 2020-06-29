import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderModelType, ISelectedModel } from '../../../broadcast/components/header/header.component';
import { EventLoadService } from '../../../broadcast/core/event/event-load.service';
import { IEvent } from '../../../broadcast/core/event/event.model';
import { TournamentLoadService } from '../../../broadcast/core/tournament/tournament-load.service';
import { CommonTournament } from '../../../broadcast/core/tournament/tournament.model';
import { ScreenStateService } from '@app/shared/screen/screen-state.service';

@Component({
  selector: 'wc-main-broadcast-nav',
  templateUrl: './main-broadcast-nav.component.html',
  styleUrls: ['./main-broadcast-nav.component.scss']
})
export class MainBroadcastNavComponent implements OnInit {

  public currentTournament: CommonTournament;

  public currentEvent: IEvent;

  @Input() compact = false;

  constructor(
    private router: Router,
    private tournamentLoad: TournamentLoadService,
    private eventLoad: EventLoadService,
    private screenState: ScreenStateService,
  ) { }

  ngOnInit() {
    this.tournamentLoad.getCurrent().subscribe(async (tournament) => {
      this.currentTournament = tournament;
      this.currentEvent = await this.eventLoad.getWhenLacking(tournament.event).toPromise();
    });
  }

  async onChangeNavigation(item: ISelectedModel) {
    const routerCommands = [];

    const getNavCommandFromDefaults = defaults => {
      if (defaults) {
        if (defaults.board_id) {
          return ['pairing', `${defaults.board_id}`];
        } else if (defaults.match_id) {
          return ['match', `${defaults.match_id}`];
        } else if (defaults.tour_id) {
          return ['tour', `${defaults.tour_id}`];
        }
      }

      return [];
    };

    switch (item.type) {
      case HeaderModelType.Cycle: {
        const defaults = await this.eventLoad.getDefaults(item.model.id).toPromise();

        if (defaults && defaults.tournament_id) {
          routerCommands.push(
            'tournament',
            defaults.tournament_id,
            ...getNavCommandFromDefaults(defaults)
          );
        }

        break;
      }

      case HeaderModelType.Tournament: {
        const defaults = await this.tournamentLoad.getDefaults(item.model.id).toPromise();

        routerCommands.push(
          'tournament',
          item.model.id,
          ...getNavCommandFromDefaults(defaults)
        );

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

}
