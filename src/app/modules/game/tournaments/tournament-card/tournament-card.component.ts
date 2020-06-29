import { GameTranslateService } from './../../service/game-translate.service';
import { Component, Input, OnInit } from '@angular/core';
import { IOnlineTournament } from '@app/modules/game/tournaments/models/tournament.model';
import * as moment from 'moment';
import { BoardType, GameRatingMode } from '@app/broadcast/core/tour/tour.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ICountry } from '@app/broadcast/core/country/country.model';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { Router } from '@angular/router';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';

@Component({
  selector: 'wc-tournament-card',
  templateUrl: './tournament-card.component.html',
  styleUrls: ['./tournament-card.component.scss']
})
export class TournamentCardComponent implements OnInit {
  @Input()
  tournament: IOnlineTournament;
  @Input()
  width = 280;
  @Input()
  fullWidthMobile = false;

  moment = moment;
  memberCounter = 0;
  GameRatingMode = GameRatingMode;
  countries$: BehaviorSubject<ICountry[]> = new BehaviorSubject([]);

  durationFormat: moment.DurationFormatSettings = {
    trim: 'both',
    trunc: true,
    usePlural: false,
    useSignificantDigits: true
  };

  constructor(
    private gameSharedService: GameSharedService,
    private countryService: CountryResourceService,
    private route: Router,
    private gameTranslateService: GameTranslateService
  ) {
    this.countryService.getAll().subscribe(this.countries$);
  }

  ngOnInit() {
    this.memberCounter = (this.tournament.signed_up_amount * 100 / this.tournament.players_amount) * 360 / 100;
  }

  boardTypeTitle(boardType: BoardType) {
    return this.gameSharedService.boardTypeTitle(boardType);
  }

  getBoardType(): string {
    if ( Object.keys(this.tournament).length ) {
      const boardType = this.tournament.time_control.board_type;
      return this.gameSharedService.boardTypeTitle(boardType);
    } else {
      return '';
    }
  }

  getCountryName(code: number) {
    return this.countryService.getCountryName(code);
  }

  getBoardTypeTitle(boardType: string = ''): Observable<string> {
    if (boardType) {
      return this.gameTranslateService.getTranslate(`GAME.${boardType.toUpperCase()}`);
    } else {
      return of(null);
    }
  }

  goToTournament() {
    this.route.navigate([`/tournament/${this.tournament.id}`]).then();
  }

  isFideTournament() {
    return this.tournament.rating_type === GameRatingMode.FIDERATED;
  }

  isMtsTournament() {
    return this.tournament.sponsor === 'mts';
  }
}
