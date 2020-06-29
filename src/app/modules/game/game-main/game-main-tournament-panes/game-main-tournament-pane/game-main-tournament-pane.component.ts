import { GameTranslateService } from './../../../service/game-translate.service';
import { takeUntil, filter } from 'rxjs/operators';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { Component, Input, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { IOnlineTournament } from '@app/modules/game/tournaments/models/tournament.model';
import { BoardType, GameRatingMode } from '@app/broadcast/core/tour/tour.model';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import moment = require('moment');
import { OnChangesObservable, OnChangesInputObservable } from '@app/shared/decorators/observable-input';

@Component({
  selector: 'wc-game-main-tournament-pane',
  templateUrl: './game-main-tournament-pane.component.html',
  styleUrls: ['./game-main-tournament-pane.component.scss'],
})
export class GameMainTournamentPaneComponent implements OnInit, OnChanges, OnDestroy {

  /**
   * Destruction of the observer.
   * @type {Subject}
   * @memberof GameMainTournamentPaneComponent
   */
  destroy$ = new Subject();

  /**
   *
   * @type {IOnlineTournament}
   * @memberof GameMainTournamentPaneComponent
   */
  @Input() tournament: IOnlineTournament;

  @OnChangesInputObservable('tournament')
  tournament$ = new BehaviorSubject<IOnlineTournament>(this.tournament);

  memberCounter = 0;
  tournamentStartTime = '';
  moment = moment;
  GameRatingMode = GameRatingMode;
  durationFormat: moment.DurationFormatSettings = {
    trim: 'both',
    trunc: true,
    usePlural: false,
    useSignificantDigits: true,
  };

  /**
   *Creates an instance of GameMainTournamentPaneComponent.
   * @param {GameSharedService} gameSharedService
   * @param {CountryResourceService} countryService
   * @param {TranslateService} translate
   * @memberof GameMainTournamentPaneComponent
   */
  constructor(
    private gameSharedService: GameSharedService,
    private countryService: CountryResourceService,
    private gameTranslateService: GameTranslateService
    ) {}

  ngOnInit() {
    this.tournament$.pipe(
      filter(tournament => !!tournament),
      takeUntil(this.destroy$)
    ).subscribe( ({signed_up_amount, players_amount, datetime_of_tournament}) => {
      this.memberCounter = (((signed_up_amount * 100) / players_amount) * 360) / 100;
      this.tournamentStartTime = moment(datetime_of_tournament).local().format('YYYY-MM-DD HH:mm:ss');
    });
  }

  getDay(day: string = ''): Observable<string> {
    return this.gameTranslateService.getTranslate(`TIME.${day.toUpperCase()}`);
  }

  boardTypeTitle(boardType: BoardType) {
    return this.gameSharedService.boardTypeTitle(boardType);
  }

  getBoardTypeTitle(boardType: string = ''): Observable<string> {
    return this.gameTranslateService.getTranslate(`GAME.${boardType.toUpperCase()}`);
  }

  getCountryName(code: number) {
    return this.countryService.getCountryName(code);
  }

  @OnChangesObservable()
  ngOnChanges() {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
