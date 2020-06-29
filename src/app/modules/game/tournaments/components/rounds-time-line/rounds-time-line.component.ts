import { TournamentStatus } from '@app/broadcast/core/tournament/tournament.model';
import { IOnlineTournament } from '../../models/tournament.model';
import { TournamentState } from '../../states/tournament.state';
import { Select } from '@ngxs/store';
import { Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { interval, Observable } from 'rxjs';
import { SubscriptionHelper, Subscriptions } from '@app/shared/helpers/subscription.helper';

export enum RoundIntervalType {
  ROUND,
  BREAK
}

export interface IRoundIntervalBase {
  datetime: {
    lower: string;
    upper: string;
  };
}

export interface IRoundIntervalRound extends IRoundIntervalBase {
  type: RoundIntervalType.ROUND;
  tour_number: number;
  hide_time?: boolean;
}

export interface IRoundIntervalBreak extends IRoundIntervalBase {
  type: RoundIntervalType.BREAK;
}

export type IRoundInterval = IRoundIntervalRound | IRoundIntervalBreak;

const timer$ = interval(300);

@Component({
  selector: 'wc-rounds-time-line',
  templateUrl: './rounds-time-line.component.html',
  styleUrls: ['./rounds-time-line.component.scss']
})
export class RoundsTimeLineComponent implements OnInit, OnDestroy {

  @Select(TournamentState.getTournament) getTournament$: Observable<IOnlineTournament>;
  TournamentStatus = TournamentStatus;

  @HostBinding('class')
  componentClass = 'rounds-timeline'; // @todo remove.

  @Input() intervals: IRoundInterval[] = [];

  RoundIntervalType = RoundIntervalType;

  moment = moment;

  timeLinePosition: number = null;
  timeLineIntervalIndex: number = null;
  timeLineTime = '';

  private subs: Subscriptions = {};

  constructor() {

  }

  private updateTimeline(time: string) {
    const now = moment(time);

    let currentIntervalIndex = null;
    let intervalDuration = null;
    let intervalDiff = null;
    if (this.intervals) {
      for (const [index, interval] of this.intervals.entries()) {
        intervalDuration = moment(interval.datetime.upper).diff(interval.datetime.lower);
        intervalDiff = moment(now).diff(interval.datetime.lower);

        if (intervalDiff >= 0 && intervalDiff <= intervalDuration) {
          currentIntervalIndex = index;
          break;
        }
      }
    }

    const position = intervalDiff / intervalDuration;

    if (currentIntervalIndex !== null) {
      this.timeLineIntervalIndex = currentIntervalIndex;
      this.timeLinePosition = position * 100;
    } else if (moment(now).diff(this.intervals[0].datetime.lower) <= 0) {
      this.timeLinePosition = 0;
      this.timeLineIntervalIndex = 0;
    } else if (moment(now).diff(this.intervals[this.intervals.length - 1].datetime.upper) >= 0) {
      this.timeLinePosition = 100;
      this.timeLineIntervalIndex = this.intervals.length - 1;
    }

    this.timeLineTime = now.format('HH:mm');
  }

  nextTick() {
    const time = moment().toISOString();

    this.updateTimeline(time);
  }

  ngOnInit() {
    this.subs.timer = timer$.subscribe(() => this.nextTick());
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }
}
