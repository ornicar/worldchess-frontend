import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
  OnChanges
} from '@angular/core';
import { GetTeamPlayersWithParams, ClearTeamPlayers } from '../team-players/team-players.actions';
import { Store, select } from '@ngrx/store';
import * as fromRoot from '../../../reducers/index';
import { combineLatest, Subscription, BehaviorSubject } from 'rxjs';
import { selectTeamsByTournament } from '../chess-footer-information/chess-footer-information.component';
import * as fromTeamPlayers from '../team-players/team-players.reducer';
import * as fromTeams from '../../core/team/team.reducer';
import { ITeam } from '../../core/team/team.model';
import { ITeamPlayer } from '../team-players/team-players.model';
import { filter, map, switchMap, first } from 'rxjs/operators';
import { OnChangesInputObservable, OnChangesObservable } from '../../../shared/decorators/observable-input';
import { Tournament } from '../../core/tournament/tournament.model';

@Component({
  selector: 'wc-info-all-players-modal',
  templateUrl: './info-all-players-modal.component.html',
  styleUrls: ['./info-all-players-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoAllPlayersModalComponent implements OnInit, OnChanges, OnDestroy {
  public teamsSs: Subscription;

  public teams: ITeam[] = [];

  public selectTeamsByTournament = selectTeamsByTournament();
  @Output()
  public closeModal = new EventEmitter();

  @Input()
  public tournament = null;

  public playersLimit = 100;

  // limit by teams
  public limit = 5;
  // offset by teams
  public offset = 0;

  @OnChangesInputObservable('tournament')
  public tournament$ = new BehaviorSubject<Tournament>(this.tournament);

  public teams$ = this.tournament$.pipe(
    filter(tournament => !!tournament),
    map(tournament => tournament.id),
    switchMap(tournamentId => this.store$.pipe(select(this.selectTeamsByTournament, { tournamentId }))),
  );

  public allTeams$ = this.store$.pipe(
    select(fromTeams.selectAll)
  );

  public allTeamPlayers$ = this.store$.select(fromTeamPlayers.selectAll);

  public teamsWithPlayers$ = combineLatest(this.teams$, this.allTeamPlayers$).pipe(
    filter((combined) => (combined[0].length > 0) && (combined[1].length > 0)),
    map((combined) => this.combineTeamsAndPlayers(combined[0], combined[1]))
  );

  constructor(private cd: ChangeDetectorRef, private store$: Store<fromRoot.State>) { }


  public ngOnInit() {
    this.store$.dispatch(new ClearTeamPlayers());
    this.requestTeamPlayers();
  }
  @OnChangesObservable()
  ngOnChanges() {
  }

  public ngOnDestroy() {
  }

  public requestTeamPlayers() {
    this.teams$.pipe(
      first()
    ).subscribe((teams) => {
      this.loadTeamPlayersByTeams(teams);
    });
  }

  public onWrapperClick($event) {
    $event.stopPropagation();
  }

  public loadTeamPlayersByTeams(teams: ITeam[]) {
    const teamsIds = teams
      .slice(this.offset, this.offset + this.limit)
      .map((team) => team.id);
    this.store$.dispatch(new GetTeamPlayersWithParams({
      params: {
        team_id: teamsIds.join(','),
        limit: `${this.playersLimit}`,
        offset: '0',
        expand: 'player'
      }
    }));
  }

  public canShowMore() {
    return this.teams$.pipe(
      first(),
      map((teams) => this.limit + this.offset < teams.length)
    );
  }

  public onShowMore() {
    if (this.canShowMore()) {
      this.offset = this.offset + this.limit;
      this.requestTeamPlayers();
      this.cd.markForCheck();
    }
  }

  private combineTeamsAndPlayers(teams: ITeam[], players: ITeamPlayer[]) {
    return teams.map((team: ITeam) => {
      // @TODO Move sorting to store!
      const sortedPlayers = team.players
        .map((playerId: number) => players
          .find((player: ITeamPlayer) => playerId === player.player.fide_id));
      sortedPlayers.sort((player1, player2) => {
        if (player1.board_number < player2.board_number) { return -1; }
        if (player1.board_number > player2.board_number) { return 1; }
        return 0;
      });
      return {
        ...team,
        players: sortedPlayers
      };
    }).filter(item => !!item.players && !!item.players[0] && !!item.players[0].id);
  }

  public trackTeamByFn(index, item) {
    return item.id;
  }

  public trackPlayerByFn(index, item) {
    return item.id;
  }

}
