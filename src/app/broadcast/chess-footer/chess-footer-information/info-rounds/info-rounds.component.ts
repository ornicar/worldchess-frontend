import { Component, OnInit, Input } from '@angular/core';
import { ISchedule } from '../../schedule/schedule.model';
import * as moment from 'moment';

@Component({
  selector: 'wc-info-rounds',
  templateUrl: './info-rounds.component.html',
  styleUrls: ['./info-rounds.component.scss']
})
export class InfoRoundsComponent implements OnInit {
  @Input() public rounds: ISchedule[] = [];

  constructor() { }

  ngOnInit() {
  }

  public getState(round: ISchedule): number {
    // 0 is past, 1 is today, 2 is future
    const date = new Date(round.start);
    const now = new Date();

    const tournamentOffset = -240; // in minutes
    const minOffset = now.getTimezoneOffset();
    const nowWithOffset = moment(now).add(minOffset - tournamentOffset, 'minutes');

    if ( moment(date).isSame(nowWithOffset, 'day')) {
      return 1;
    } else if ( moment(date).isBefore(nowWithOffset, 'day')) {
      return 0;
    } else {
      return 2;
    }
  }

  public isPast(round) {
    return this.getState(round) === 0;
  }

  public isNow(round) {
    return this.getState(round) === 1;
  }

  public getDayOfWeek(round: ISchedule): string {
    const date = new Date(round.start);
    return date.toLocaleString('en-us', {  weekday: 'long' });
  }

  public getDate(round: ISchedule): string {
    const date = new Date(round.start);
    return date.toLocaleString('en-us', {  month: 'long', day: 'numeric' });
  }

  public getScribble(i): string {
    return `assets/img/strikeout/scribble${i % 11 + 1}.svg`;
  }
}
