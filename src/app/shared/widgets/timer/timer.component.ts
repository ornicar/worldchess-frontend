import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import * as moment from 'moment';
import {interval} from 'rxjs';
import {SubscriptionHelper, Subscriptions} from '../../helpers/subscription.helper';

// @todo check that this timer is not working when have not subscribers.
const timer$ = interval(300);

@Component({
  selector: 'wc-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerComponent implements OnInit, OnDestroy {

  @Input() format: string;

  @Input() date: string;

  @Input() stopAfterZero = true;

  @Input() stopTrim: string = null;

  countdown = '';

  private subs: Subscriptions = {};

  private get settings(): moment.DurationFormatSettings {
    return this.stopTrim ? {stopTrim: this.stopTrim} : {trim: false};
  }

  constructor(
    private zone: NgZone,
    private cd: ChangeDetectorRef
  ) { }

  nextTick() {
    let countdownMs = moment(this.date).diff(moment());

    if (countdownMs > 0) {
    } else if (this.stopAfterZero) {
      countdownMs = 0;
    } else {
      countdownMs = Math.abs(countdownMs);
    }

    const countdown = moment.duration(countdownMs).format(this.format, this.settings);

    if (this.countdown !== countdown) {
      this.zone.run(() => {
        this.countdown = countdown;
        this.cd.detectChanges();
      });
    }
  }

  ngOnInit() {
    this.zone.runOutsideAngular(() =>
      this.subs.timer = timer$.subscribe(() => this.nextTick())
    );
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }
}
