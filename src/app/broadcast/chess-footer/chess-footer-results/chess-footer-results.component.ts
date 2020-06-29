import {
  Component,
  OnInit,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  Output,
  Input,
  OnChanges
} from '@angular/core';
import { Subscription, Observable, BehaviorSubject, combineLatest, forkJoin } from 'rxjs';
import { Tournament, TournamentStatus, TournamentType, TournamentResourceType} from '../../core/tournament/tournament.model';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import { filter, map, tap } from 'rxjs/operators';
import { OnChangesInputObservable, OnChangesObservable } from '../../../shared/decorators/observable-input';
import { ITour } from '../../core/tour/tour.model';
import { IResultsLists, Result, IPlayerResults, IResultRecord } from '../../core/result/result.model';
import * as fromTurnament from '../../core/tournament/tournament.reducer';
import {GetFideTournamentResults, GetFounderTournamentResults} from '../../core/tournament/tournament.actions';
import { IPlayer } from '../../core/player/player.model';
import { ActivatedRoute } from '@angular/router';
import { IBoard } from '@app/broadcast/core/board/board.model';

interface IAggregatedResults {
  [key: number]: IPlayerResults;
  [key: string]: IPlayerResults;
}

@Component({
  selector: 'wc-chess-footer-results',
  templateUrl: './chess-footer-results.component.html',
  styleUrls: ['./chess-footer-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessFooterResultsComponent implements OnInit, OnDestroy, OnChanges {
  @Output() changeTab = new EventEmitter();

  public classicList = [];
  public rapidList = [];
  public blitzList = [];
  public armageddonList = [];
  public results: IResultRecord[];
  public players: IPlayer[];

  public playersResults: IPlayerResults[];

  public subs: Subscription[] = [];

  public tournamentTypes = TournamentType;

  @Input() tour = null;

  @OnChangesInputObservable('tour')
  public tour$: Observable<ITour> = new BehaviorSubject<ITour>(this.tour);

  @Input() tournament: Tournament = null;
  @OnChangesInputObservable('tournament')
  public tournament$: Observable<Tournament> = new BehaviorSubject<Tournament>(this.tournament);

  public tournamentResults$: Observable<IResultsLists> = this.store$.select(fromTurnament.selectTournamentResults);

  public isEnd$ = this.tournament$.pipe(
    map(tournament => !!(tournament && tournament.status === TournamentStatus.COMPLETED))
  );

  static getPlayerKey(result: IResultRecord, keyName: string): string | number {
    return result[keyName] ? result[keyName].fide_id : result[`${keyName}_name`];
  }


  constructor(
    private cd: ChangeDetectorRef,
    private store$: Store<fromRoot.State>,
    private activatedRoute: ActivatedRoute,
    ) { }

  public ngOnInit() {

    this.subs.push(
      combineLatest([
        this.activatedRoute.data.pipe(
          map((data: { tournament: Tournament, board: IBoard }) => data.tournament),
        ),
        this.tournament$,
      ]).pipe(
        map(([t1, t2]) => t1 || t2),
        filter(t => !!t),
      ).subscribe((tournament) => {
         this.tournament = tournament;
         switch (tournament.resourcetype) {
           case TournamentResourceType.Tournament:
             this.store$.dispatch(new GetFideTournamentResults({ id: tournament.id }));
             break;

           case TournamentResourceType.FounderTournament:
             this.store$.dispatch(new GetFounderTournamentResults({ id: tournament.id }));
             break;
         }
       }));

    this.subs.push(this.tournamentResults$.subscribe((items) => {
      this.classicList = items.Classic || [];
      this.rapidList = items.Rapid || [];
      this.blitzList = items.Blitz || [];
      this.armageddonList = items.Armageddon || [];
      this.results = [
        ...this.classicList,
        ...this.rapidList,
        ...this.blitzList,
        ...this.armageddonList,
      ].filter(result => result.result !== null);
      const playersResults = this.getPlayersResults();
      this.playersResults = playersResults.slice(0, 8);
      this.players = playersResults.map(result => result.player);
      this.cd.markForCheck();
    }));
  }

  @OnChangesObservable()
  public ngOnChanges() {
  }

  public ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  public getPlayersResults(): IPlayerResults[] {
    if (!this.results || this.results.length === 0) {
      return [];
    }

    const playersMap: IAggregatedResults = this.getAgregatedResults(this.results);
    return Object.values(playersMap).sort((player1, player2) => player2.total - player1.total);
  }

  private getAgregatedResults(results: IResultRecord[]): IAggregatedResults {
    const playersMap: IAggregatedResults = {};

    results.forEach((result) => {
      if (result.result === null) {
        return;
      }

      const whitePlayerKey = ChessFooterResultsComponent.getPlayerKey(result, 'white_player');
      const blackPlayerKey = ChessFooterResultsComponent.getPlayerKey(result, 'black_player');

      if (playersMap[whitePlayerKey] === undefined) {
        playersMap[whitePlayerKey] = this.getInitPlayerResults(whitePlayerKey, result.white_player);
      }

      if (playersMap[blackPlayerKey] === undefined) {
        playersMap[blackPlayerKey] = this.getInitPlayerResults(blackPlayerKey, result.black_player);
      }

      if (result.result !== Result.NOT_PLAYED) {
        playersMap[whitePlayerKey].games++;
        playersMap[blackPlayerKey].games++;
      }

      switch (result.result) {
        case Result.BLACK_WIN:
          playersMap[blackPlayerKey].wins++;
          playersMap[blackPlayerKey].total++;
          playersMap[whitePlayerKey].loss++;
          break;

        case Result.WHITE_WIN:
          playersMap[whitePlayerKey].wins++;
          playersMap[whitePlayerKey].total++;
          playersMap[blackPlayerKey].loss++;
          break;

        case Result.DRAW:
          playersMap[whitePlayerKey].draw++;
          playersMap[blackPlayerKey].draw++;
          playersMap[whitePlayerKey].total += 0.5;
          playersMap[blackPlayerKey].total += 0.5;
          break;
      }
    });

    return playersMap;
  }

  private getInitPlayerResults(playerKey: number | string, player: IPlayer): IPlayerResults {
    if (typeof playerKey === 'string') {
      player = {
        full_name: playerKey,
        fide_id: null,
        federation: null,
        id: null,
      };
    }
    return { games: 0, wins: 0, draw: 0, loss: 0, total: 0, player };
  }

  public checkTournamentType(type: TournamentType): boolean {
    return this.tournament && this.tournament.tournament_type === type;
  }
}
