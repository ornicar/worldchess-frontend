import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  AfterViewChecked
} from '@angular/core';
import { IAccount } from '@app/account/account-store/account.model';
import { selectMyAccount } from '@app/account/account-store/account.reducer';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import { IOnlineTournamentTeamPlayer } from '@app/broadcast/core/tournament/tournament.model';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { IOnlineTournament, IOnlineTournamentStandings } from '@app/modules/game/tournaments/models/tournament.model';
import { OnlineTournamentService } from '@app/modules/game/tournaments/services/tournament.service';
import { TournamentState } from '@app/modules/game/tournaments/states/tournament.state';
import * as fromRoot from '@app/reducers';
import { select, Store as NGRXStore } from '@ngrx/store';
import { Select } from '@ngxs/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { shareReplay, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'wc-tournament-standings',
  templateUrl: './tournament-standings.component.html',
  styleUrls: ['./tournament-standings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentStandingsComponent implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  @Input() tournamentId: string;

  @ViewChild('tableContent', { static: true }) tableContent;
  @ViewChild('tableWrapper', { static: true }) tableWrapper;

  @Select(TournamentState.getTournamentPlayers) tournamentPlayers$: Observable<IOnlineTournamentTeamPlayer[]>;
  @Select(TournamentState.getTournament) tournament$: Observable<IOnlineTournament>;
  @Select(TournamentState.getStandings) getStandings$: Observable<IOnlineTournamentStandings[]>;

  public Math = Math;
  public tableShadow$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public account$: Observable<IAccount> = this.store$.pipe(
    select(selectMyAccount),
    shareReplay(1)
  );

  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    public tournamentService: OnlineTournamentService,
    private gameResourceService: GameResourceService,
    private countryService: CountryResourceService,
    private store$: NGRXStore<fromRoot.State>,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    /*interval(5000).pipe(
      withLatestFrom(this.tournament$),
      takeWhile(([_, tournament]) => tournament.status !== TournamentStatus.COMPLETED),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.fetchData();
    });*/
  }

  ngAfterViewChecked() {
    this.addShadow();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    /*  if (changes['tournamentId']) {
        this.fetchData();
      }*/
  }

  public getCountryCode(id: number): Observable<string> {
    return this.countryService.getCountryCode(id);
  }

  private addShadow(): void {
    this.tableShadow$.next(this.tableContent.nativeElement.clientHeight > this.tableWrapper.nativeElement.clientHeight);
  }

  /*fetchData() {
    this.gameResourceService.getOnlineTournamentStandings(this.tournamentId)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(data) => {
        this.onlineTournamentStandings$.next(data);
        /*const tempResults = [...results];

        players.forEach((player) => {
          const indexOfPlayerInResult = results.findIndex((res) => res.player_uid === player.player_uid);
          if (indexOfPlayerInResult === -1) {
            tempResults.push({
              age: player.age,
              avatar: player.avatar,
              full_name: player.full_name,
              nationality_id: player.nationality_id,
              player_uid: player.player_uid,
              rank: +player.rank,
              rating: player.rating,
              points: 0,
              points_per_board: []
            });
          }
        });

      });
  }*/
}
