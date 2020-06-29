import {Component, Input, OnInit} from '@angular/core';
import {ITournament} from "@app/broadcast/core/tournament/tournament.model";
import {BehaviorSubject} from "rxjs";
import {ICountry} from "@app/broadcast/core/country/country.model";
import {Router} from "@angular/router";
import * as moment from 'moment';
import {getCurrencySymbol} from "@angular/common";

@Component({
  selector: 'offline-tournament-timeline-card',
  templateUrl: './offline-tournament-timeline-card.component.html',
  styleUrls: ['./offline-tournament-timeline-card.component.scss']
})
export class OfflineTournamentTimelineCardComponent implements OnInit {

  @Input()
  tournament: ITournament;
  @Input()
  width = 280;
  @Input()
  fullWidthMobile = false;

  moment = moment;
  memberCounter = 0;
  countries$: BehaviorSubject<ICountry[]> = new BehaviorSubject([]);

  get isMale() {
    return true;
  }

  get playersCount(){
    return 111;
  }

  get country(){
    return "Russia"
  }

  get currencySign(){
    return getCurrencySymbol(this.tournament.prize_fund_currency,'narrow')
  }

  durationFormat: moment.DurationFormatSettings = {
    trim: 'both',
    trunc: true,
    usePlural: false,
    useSignificantDigits: true
  };

  constructor(
    private route: Router
  ) {
  }

  ngOnInit() {

  }

  goToTournament() {
    this.route.navigate([`/tournament/${this.tournament.id}`]);
  }
}
