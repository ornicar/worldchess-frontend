import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnChanges,
  Input
} from '@angular/core';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { Tournament } from '../../core/tournament/tournament.model';
import { Store, createSelector, select } from '@ngrx/store';
import * as fromRoot from '../../../reducers/index';
import * as fromTeam from '../../core/team/team.reducer';
import * as fromSchedule from '../schedule/schedule.reducer';
import * as fromTeamPlayers from '../team-players/team-players.reducer';
import { ISchedule } from '../schedule/schedule.model';
import { SetFooterSelectedTeam, ClearFooterSelectedTeam } from '../../core/team/team.actions';
import { ITeam } from '../../core/team/team.model';
import { GetSchedulesByTournamentId } from '../schedule/schedule.actions';
import * as moment from 'moment';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { GetSelectedTeamPlayersWithParams, ClearSelectedTeamPlayers } from '../team-players/team-players.actions';
import { OnChangesObservable, OnChangesInputObservable } from '../../../shared/decorators/observable-input';

export const compareTeamsLists = (a: ITeam[], b: ITeam[]) => {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((item, index) => item === b[index]);
};


export const selectTeamsByTournament = () => createSelector(
  fromTeam.selectAll, (teams: ITeam[],  { tournamentId }: { tournamentId: number}) => {
    return teams.filter(team => team.tournament === tournamentId);
  }
);

@Component({
  selector: 'wc-chess-footer-information',
  templateUrl: './chess-footer-information.component.html',
  styleUrls: ['./chess-footer-information.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessFooterInformationComponent implements OnInit, OnDestroy, OnChanges {
  @Output() changeTab = new EventEmitter();
  public tournamentSs: Subscription;
  public teamsSs: Subscription;
  public selectedTeamSs: Subscription;
  public selectTeamsByTournament = selectTeamsByTournament();

  @Input() tournament = null;

  @OnChangesInputObservable('tournament')
  public tournament$ = new BehaviorSubject<Tournament>(this.tournament);

  public schedules$: Observable<ISchedule[]> = this.store$.select(fromSchedule.selectAll)
    .pipe(map((value) => this.addEmptyDaysAsRestDays(value)));

  public selectedTeam$ = this.store$.select(fromTeam.selectFooterSelectedTeam);
  public teams$ = this.tournament$.pipe(
    filter(tournament => Boolean(tournament)),
    map(tournament => tournament.id),
    switchMap((tournamentId) =>
      this.store$.pipe(
        select(this.selectTeamsByTournament, {tournamentId}),
        map((teams) => teams.filter((team: ITeam) => (team.players && team.players.length > 0)))
      )
    ),
    distinctUntilChanged(compareTeamsLists)
  );

  public selectedTeamPlayers$ = this.store$.select(fromTeamPlayers.selectSelectedTeamPlayers);

  public showModal = false;

  constructor(private cd: ChangeDetectorRef, private store$: Store<fromRoot.State>) { }

  public ngOnInit() {
    this.tournamentSs = this.tournament$
      .pipe(filter(tournament => Boolean(tournament)))
      .subscribe((tournament) => {
        this.store$.dispatch(new GetSchedulesByTournamentId({ id: tournament.id }));
      });

    this.teamsSs = this.teams$
      .pipe(
        map(teams => teams[0]),
      )
      .subscribe((team) => {
        if (team) {
          this.onSelectTeam(team);
        } else {
          this.store$.dispatch(new ClearFooterSelectedTeam());
        }
      });

    this.selectedTeamSs = this.selectedTeam$
      .pipe(
        distinctUntilChanged()
      )
      .subscribe(team => {
        if (team) {
          const teamId = `${team.id}`;
          this.store$.dispatch(new GetSelectedTeamPlayersWithParams({ params:
            { team_id: teamId, expand: 'player', limit: '5', offset: '0' } }));
        } else {
          this.store$.dispatch(new ClearSelectedTeamPlayers());
        }
      });
  }

  @OnChangesObservable()
  public ngOnChanges() {
  }

  public ngOnDestroy() {
    this.tournamentSs.unsubscribe();
    this.teamsSs.unsubscribe();
    this.selectedTeamSs.unsubscribe();
  }

  public onSelectTeam(team: ITeam) {
    this.store$.dispatch(new SetFooterSelectedTeam({ id: team.id }));
  }

  public onToggleModal(flag?: boolean) {
    if (flag !== undefined) {
      this.showModal = flag;
    } else {
      this.showModal = !this.showModal;
    }
    if (this.showModal) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    this.cd.markForCheck();
  }

  public onClickOverlay($event: Event) {
    $event.stopPropagation();
    this.onToggleModal(false);
  }

  private addEmptyDaysAsRestDays(list: ISchedule[]): ISchedule[] {
    if (!list || list.length === 0) {
      return [];
    }
    const firstDay = list[0];
    const lastDay = list[list.length - 1];
    const firstDate = moment(firstDay.start).startOf('date');
    const lastDate = moment(lastDay.start).startOf('date');
    const duration = moment.duration(lastDate.diff(firstDate)).asDays() + 1;
    return new Array(Math.trunc(duration) + 1).join('*').split('')
      .map((item, idx) => ({
        date: moment(firstDay.start).add(idx, 'days').toISOString(),
      }))
      .map((item, idx) => list.find(day => {
        const day1 = moment(day.start).get('date');
        const month1 = moment(day.start).get('month');
        const day2 = moment(item.date).get('date');
        const month2 = moment(item.date).get('month');
        return day1 === day2 && month1 === month2;
      }) ||
        ({
          start: item.date,
          description: 'Rest Day',
          is_rest_day: true,
          tournament: firstDay.tournament
        })
      );
  }


}
