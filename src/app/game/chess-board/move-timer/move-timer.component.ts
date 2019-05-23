import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'move-timer',
  templateUrl: 'move-timer.component.html',
  styleUrls: ['move-timer.component.scss']
})
export class MoveTimerComponent implements OnChanges, OnInit {
  @Input()
  isActive: boolean;

  @Input()
  startTime = 180;

  public timeFormatSettings: moment.DurationFormatSettings = {
    trim: false,
  };

  public timer: number = this.startTime;
  private timerId: number;

  private startTimer(): void {
    this.timerId = window.setInterval(() => {
      this.timer--;

      if (this.timer === 0) {
        this.stopTimer();
      }
    }, 1000);
  }

  private stopTimer(): void {
    window.clearInterval(this.timerId);
  }

  public resetTimer(): void {
    this.timer = this.startTime;
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.startTime) {
      this.resetTimer();
    }

    if (this.isActive) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }

  ngOnInit() {
    this.resetTimer();
  }

}
