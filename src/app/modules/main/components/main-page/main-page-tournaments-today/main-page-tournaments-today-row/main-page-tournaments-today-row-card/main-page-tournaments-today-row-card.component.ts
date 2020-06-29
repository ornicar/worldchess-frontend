import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {BehaviorSubject, Subject} from "rxjs";
import {IOnlineTournament} from "@app/modules/game/tournaments/models/tournament.model";
import {OnChangesInputObservable, OnChangesObservable} from "@app/shared/decorators/observable-input";
import {CountryResourceService} from "@app/broadcast/core/country/country-resource.service";
import {Router} from "@angular/router";
import {TournamentService} from "@app/modules/app-common/services/tournament.service";
import {filter, takeUntil} from "rxjs/operators";
import moment = require('moment');
import { GameRatingMode } from '@app/broadcast/core/tour/tour.model';

@Component({
  selector: 'main-page-tournaments-today-row-card',
  templateUrl: './main-page-tournaments-today-row-card.component.html',
  styleUrls: ['./main-page-tournaments-today-row-card.component.scss']
})
export class MainPageTournamentsTodayRowCardComponent implements OnInit {


  /**
   * Destruction of the observer.
   * @type {Subject}
   * @memberof GameMainTournamentPaneComponent
   */
  destroy$ = new Subject();

  @Input()
  isDragging: boolean;

  /**
   *
   * @type {IOnlineTournament}
   * @memberof GameMainTournamentPaneComponent
   */
  @Input() tournament: IOnlineTournament;

  @OnChangesInputObservable('tournament')
  tournament$ = new BehaviorSubject<IOnlineTournament>(this.tournament);

  tournamentPlayers$ = new BehaviorSubject( []);

  memberCounter = 0;
  signupStart = '';
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
   * @memberof GameMainTournamentPaneComponent
   */
  constructor(
    private countryService: CountryResourceService,
    private route: Router,
  ){}

  ngOnInit() {
    this.tournament$.pipe(
      filter(tournament => !!tournament),
      takeUntil(this.destroy$)
    ).subscribe( ({signed_up_amount, players_amount, signup_start_datetime}) => {
      this.memberCounter = (((signed_up_amount * 100) / players_amount) * 360) / 100;
      this.signupStart = moment(signup_start_datetime).local().format('YYYY-MM-DD HH:mm:ss');
    });
  }

  getCountryName(code: number) {
    return this.countryService.getCountryName(code);
  }

  @OnChangesObservable()
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isDragging']) {
      this.isDragging = changes['isDragging'].currentValue;
    }
  }

  gotToTournament($event) {
    if (!this.isDragging) {
      this.route.navigate([`/arena/tournament/${this.tournament.id}`]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
