import { AccountService } from './../../../../account/account-store/account.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject, interval, Observable, of, Subject } from 'rxjs';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { IPlayerInQueue } from '@app/modules/game/state/player-queue-response.model';
import { BoardType, GameRatingMode } from '@app/broadcast/core/tour/tour.model';
import { Router } from '@angular/router';
import { takeUntil, withLatestFrom } from 'rxjs/operators';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import { ICountry } from '@app/broadcast/core/country/country.model';
import { Select } from '@ngxs/store';
import { GameState } from '@app/modules/game/state/game.state';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';

@Component({
  selector: 'wc-player-queue',
  templateUrl: './player-queue.component.html',
  styleUrls: ['./player-queue.component.scss']
})
export class PlayerQueueComponent implements OnInit, OnDestroy {

  @Select(GameState.gameInProgress) gameInProgress$: Observable<boolean>;

  playersList: IPlayerInQueue[] = [];
  selectedPlayer: IPlayerInQueue;

  moment = moment;
  isLoading$ = new BehaviorSubject(false);
  initialLoading = false;

  GameRatingMode = GameRatingMode;

  durationFormat: moment.DurationFormatSettings = {
    trim: 'both',
    trunc: true,
    usePlural: false,
    useSignificantDigits: true
  };

  destroy$ = new Subject();
  countries$: BehaviorSubject<ICountry[]> = new BehaviorSubject([]);

  constructor(
    private gameResourceService: GameResourceService,
    private gameSharedService: GameSharedService,
    private route: Router,
    private countryService: CountryResourceService,
    private accountService: AccountService
  ) {
    this.countryService.getAll().subscribe(this.countries$);
  }

  ngOnInit() {
    this.fetchHistory();
    interval(5000).pipe(
      withLatestFrom(this.gameInProgress$),
      takeUntil(this.destroy$)
    ).subscribe(([_, gameInProgress]) => {
      if (!gameInProgress) {
        this.fetchHistory();
      }
    });
  }

  fetchHistory() {
    this.isLoading$.next(true);
    this.gameResourceService.getPlayerQueue().pipe(
    ).subscribe((results) => {
      this.isLoading$.next(false);
      this.initialLoading = true;
      this.playersList = results;
    });
  }

  selectPlayer(player: IPlayerInQueue) {
    this.selectedPlayer = player;
  }

  joinToGame(player: IPlayerInQueue) {
    const url = `/singlegames/invite/${player.invite_code}/human`;
    this.route.navigate([url]).then();
  }

  getCountryCode(code: number) {
    return this.countryService.getCountryCode(code);
  }

  boardTypeTitle(boardType: BoardType) {
    this.gameSharedService.boardTypeTitle(boardType);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
