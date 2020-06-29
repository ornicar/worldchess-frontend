import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { GameState } from '@app/modules/game/state/game.state';
import { BehaviorSubject, interval, Observable, Subject } from 'rxjs';
import { map, takeUntil, withLatestFrom } from 'rxjs/operators';
import * as moment from 'moment';
import { TourResourceService } from '@app/broadcast/core/tour/tour-resource.service';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import { TournamentGameState } from '@app/modules/game/tournaments/states/tournament.game.state';

@Component({
  selector: 'wc-tournament-next-opponent',
  templateUrl: './tournament-next-opponent.component.html',
  styleUrls: ['./tournament-next-opponent.component.scss']
})
export class TournamentNextOpponentComponent implements OnInit, OnDestroy {

  @Select(TournamentGameState.nextTourId) nextTourId$: Observable<string>;
  @Select(TournamentGameState.nextTourBoardId) nextTourBoardId$: Observable<string>;
  @Select(GameState.player) player$: Observable<IPlayer>;

  duration$ = new BehaviorSubject<number>(moment.duration(0, 'seconds').asMilliseconds());

  destroy$ = new Subject();

  durationFormat: moment.DurationFormatSettings = {
    trim: false,
    usePlural: false,
    useSignificantDigits: true
  };

  countdown$ = interval(1000).pipe(
    map(() => this.secondsLeft--),
    takeUntil(this.destroy$)
  );

  secondsLeft = 0;
  nextBoardId$ = new BehaviorSubject('');

  opponent: IPlayer;

  constructor(
    private tourService: TourResourceService,
    private gameResourceService: GameResourceService,
    private countryService: CountryResourceService
  ) { }

  ngOnInit() {
    this.nextTourId$.pipe(
      withLatestFrom(this.nextTourBoardId$),
      takeUntil(this.destroy$)
    ).subscribe(([nextTourId, nextTourBoardId]) => {
      if (nextTourId) {
        this.tourService.getWithDefaults(+nextTourId).pipe(
          takeUntil(this.destroy$)
        ).subscribe((tourWithDefaults) => {
          this.secondsLeft = moment(tourWithDefaults.tour.datetime_of_round).diff(moment(), 'seconds');
        });
      }
      if (nextTourBoardId) {
        this.nextBoardId$.next(nextTourBoardId);
        this.gameResourceService.getBoard(nextTourBoardId).pipe(
          withLatestFrom(this.player$),
          takeUntil(this.destroy$)
        ).subscribe(([nextBoard, player]) => {
          if (nextBoard.black_player.fide_id === player.fide_id) {
            this.opponent = nextBoard.white_player;
          } else {
            this.opponent = nextBoard.black_player;
          }
        });
      }
    });

    this.countdown$.subscribe((__timer) => {
      if (__timer >= 0) {
        this.duration$.next(
          moment.duration(__timer, 'seconds').asMilliseconds()
        );
      }
    });
  }

  getCountryCode(code: number) {
    return this.countryService.getCountryCode(code);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
