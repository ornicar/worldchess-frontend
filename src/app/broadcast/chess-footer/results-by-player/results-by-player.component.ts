import { Component, HostListener, Input, OnDestroy } from '@angular/core';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { IPlayerResults, IResultRecord, IResultsLists, Result } from '@app/broadcast/core/result/result.model';
import { ChessFooterResultsComponent } from '@app/broadcast/chess-footer/chess-footer-results/chess-footer-results.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Tournament, TournamentResourceType } from '@app/broadcast/core/tournament/tournament.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as fromTurnament from '@app/broadcast/core/tournament/tournament.reducer';
import { Store } from '@ngrx/store';
import * as fromRoot from '@app/reducers';
import { takeUntil } from 'rxjs/operators';
import { selectTournamentState } from '@app/broadcast/core/tournament/tournament.reducer';
import { GetFideTournamentResults, GetFounderTournamentResults } from '@app/broadcast/core/tournament/tournament.actions';
import { ScreenStateService } from '@app/shared/screen/screen-state.service';
import { Location } from '@angular/common';

interface IAggregatedResults {
  [key: number]: IPlayerResults;
  [key: string]: IPlayerResults;
}

@Component({
  selector: 'wc-results-by-player',
  template: `

    <table class="table-swiss-mobile">
      <ng-container *ngIf="player && getPlayerOpponentsScore(player) as scores">
        <thead>
        <tr class="table-swiss-mobile__row">
          <td class="table-swiss-mobile__col">
            {{player.full_name}} <span class="table-swiss-mobile__text-bold">&nbsp; VS</span>
          </td>
          <td class="table-swiss-mobile__col">
            Results
            <div class="table-swiss-mobile__close"></div>
          </td>
        </tr>
        </thead>
        <tbody>
        <tr class="table-swiss-mobile__row" *ngFor="let score of scores">
          <td class="table-swiss-mobile__col">
            <div class="table-swiss-mobile__player">
              {{ score.opponent | wcFullNameInitials }}
              <div class="table-swiss-mobile__flag">
                <wc-country-flag [countryId]="score?.federation"></wc-country-flag>
              </div>
            </div>
          </td>
          <td class="table-swiss-mobile__col table-swiss-mobile__col--center">
            <wc-score [score]="score.result"></wc-score>
          </td>
        </tr>
        </tbody>
      </ng-container>
    </table>
  `,
  styleUrls: [
    './results-by-player.component.scss',
  ],
})
export class ResultsByPlayerComponent implements OnDestroy {
  @Input('player') player: IPlayer;
  @Input() results: IResultRecord[];
  tournament: Tournament;

  public tournamentResults$: Observable<IResultsLists> = this.store$.select(fromTurnament.selectTournamentResults);

  destroy$ = new Subject();
  isMobile$ = new BehaviorSubject(false);

  constructor(
    private store$: Store<fromRoot.State>,
    private activatedRoute: ActivatedRoute,
    private screenService: ScreenStateService,
    private location: Location,
  ) {

    this.screenService.matchMediaMobile$.pipe(takeUntil(this.destroy$)).subscribe((isMobile) => {
      this.isMobile$.next(isMobile);
    });

    this.tournament = this.activatedRoute.snapshot.data.tournament;

    this.tournamentResults$
        .pipe(takeUntil(this.destroy$))
        .subscribe((items) => {

          if (!Object.keys(items).length) {
            switch (this.tournament.resourcetype) {
              case TournamentResourceType.Tournament:
                this.store$.dispatch(new GetFideTournamentResults({ id: this.tournament.id }));
                break;

              case TournamentResourceType.FounderTournament:
                this.store$.dispatch(new GetFounderTournamentResults({ id: this.tournament.id }));
                break;
            }
          }
          this.results = [
            ...items.Classic || [],
            ...items.Rapid || [],
            ...items.Blitz || [],
            ...items.Armageddon || [],
          ].filter(result => result.result !== null);
          const playersResults = this.getPlayersResults().slice(0, 8);
          const players = playersResults.map(result => result.player);
          this.player = players.find(p => p.full_name === this.activatedRoute.snapshot.params.playerName);
        });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
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

  getPlayerOpponentsScore(player: IPlayer): Array<{ opponent: string; result: number; federation: number; }> {
    if (!player) {
      return null;
    }

    return this.results.filter((result: IResultRecord) => {
      if (result.result === Result.NOT_PLAYED) {
        return false;
      }
      const isWhitePlayer = this.compareResultAndPlayer(result, 'white_player', player);
      const isBlackPlayer = this.compareResultAndPlayer(result, 'black_player', player);
      return isWhitePlayer || isBlackPlayer;
    }).map((result: IResultRecord) => {
      const isWhitePlayer = this.compareResultAndPlayer(result, 'white_player', player);
      if (isWhitePlayer) {
        return {
          opponent: result.black_player ? result.black_player.full_name : result.black_player_name,
          result: result.result === Result.WHITE_WIN ? 1 : result.result === Result.DRAW ? 0.5 : 0,
          federation: result.black_player && result.black_player.federation,
        };
      } else {
        return {
          opponent: result.white_player ? result.white_player.full_name : result.white_player_name,
          result: result.result === Result.BLACK_WIN ? 1 : result.result === Result.DRAW ? 0.5 : 0,
          federation: result.white_player && result.white_player.federation,
        };
      }
    });
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

  private compareResultAndPlayer(result: IResultRecord, playerColor: string, player: IPlayer): boolean {
    const playerId = this.getPlayerKey(result, playerColor);
    const firstPlayerByFideId = typeof playerId === 'number';
    const secondPlayerByFideId = Number.isInteger(player.fide_id);

    if (firstPlayerByFideId && secondPlayerByFideId) {
      return playerId === player.fide_id;
    }

    return playerId === player.full_name;
  }

  private getPlayerKey(result: IResultRecord, playerColor: string): string | number {
    return ChessFooterResultsComponent.getPlayerKey(result, playerColor);
  }

  // @HostListener('click', ['$event.target'])
  // close(event: Event) {
  //   if (!!this.isMobile$.value) {
  //     this.location.back();
  //   }
  // }
}
