import {Component, Input, OnInit, Pipe, PipeTransform} from '@angular/core';
import {Timer} from './timer';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent implements OnInit {

  @Input() countDownDate;
  @Input() mini = false;

  countdown = new Timer();

  constructor() { }

  ngOnInit() {
    this.startTimer();
  }

  startTimer() {
    this.updateTimer();
    setTimeout(() => {
      this.updateTimer();
      this.startTimer();
    }, 1000);
  }

  private updateTimer() {
    const timerItemFormat = new TimerItemPipe();

    const now = new Date().getTime();
    const distance = Math.abs(this.countDownDate - now);

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const daysNumbers = timerItemFormat.transform(days).split('');
    const hoursNumbers = timerItemFormat.transform(hours).split('');
    const minutesNumbers = timerItemFormat.transform(minutes).split('');
    const secondsNumbers = timerItemFormat.transform(seconds).split('');

    this.countdown.add({key: 'days', value: days, numbers: daysNumbers});
    this.countdown.add({key: 'hours', value: hours, numbers: hoursNumbers});
    this.countdown.add({key: 'minutes', value: minutes, numbers: minutesNumbers});
    this.countdown.add({key: 'seconds', value: seconds, numbers: secondsNumbers});
  }
}

@Pipe({name: 'timerItemFormat'})
export class TimerItemPipe implements PipeTransform {
  transform<T>(value: number): string {
    if (value < 10) {
      return `0${value}`;
    }
    return value.toString();
  }
}
