import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { EventOrganizer } from '../../core/event/event.model';
import * as fromTour from '../../core/tour/tour.reducer';
import * as fromRoot from '../../../reducers/index';
import { Store, select } from '@ngrx/store';
import { TournamentStatus, Tournament } from '../../core/tournament/tournament.model';
import { TournamentLoadService } from '../../core/tournament/tournament-load.service';
import { switchMap, map, mapTo, filter } from 'rxjs/operators';
import { ITour } from '../../core/tour/tour.model';
import * as moment from 'moment';
import { merge, timer, of, Observable, BehaviorSubject } from 'rxjs';
import { OnChangesInputObservable } from '../../../shared/decorators/observable-input';
import { IPlayerResults } from '../../core/result/result.model';

@Component({
  selector: 'wc-results-main',
  templateUrl: './results-main.component.html',
  styleUrls: ['./results-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsMainComponent {
  @Input() playersResults: IPlayerResults[];
  @Input() public isEnd = false;

  // @TODO make timer available in case of no boards are being gone now and there are any expected
  tournamentStatus = TournamentStatus;

  @Input() tournament = null;
  @OnChangesInputObservable('tournament')
  public tournament$: Observable<Tournament> = new BehaviorSubject<Tournament>(this.tournament);

  defaultParams$ = this.tournament$.pipe(
    filter((tournament) => !!tournament),
    switchMap(tournament => {
      return this.tournamentLoadService.getDefaults(tournament.id);
    })
  );

  private selectTourById = fromTour.selectTour();

  dateTimeOfRound$ = this.defaultParams$.pipe(
    switchMap((defaults) => this.store$.pipe(
        select(this.selectTourById, { tourId: defaults.tour_id })
      )
    ),
    map((tour: ITour) => tour.datetime_of_round),
    switchMap((dateTime) => {
      const duration = moment(dateTime).diff(moment());
      return duration > 0 ?
        merge(of(dateTime), timer(duration).pipe(mapTo(null)))
        : of(null);
    })
  );

  constructor(
    private store$: Store<fromRoot.State>,
    private tournamentLoadService: TournamentLoadService,
    ) { }

  public isWinner(playerResults: IPlayerResults): boolean {
    if (this.playersResults.length !== 2) {
      return false;
    }

    if (this.playersResults[0].total === this.playersResults[1].total) {
      return false;
    }

    if (Math.max.apply(null, this.playersResults.map(result => result.total)) === playerResults.total) {
      return true;
    }

    return false;
  }
}
