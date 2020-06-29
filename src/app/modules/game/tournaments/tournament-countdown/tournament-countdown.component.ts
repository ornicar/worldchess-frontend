import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Select } from '@ngxs/store';
import { GameState } from '@app/modules/game/state/game.state';
import { BehaviorSubject, interval, Observable, Subject, timer } from 'rxjs';
import * as moment from 'moment';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'tournament-countdown',
  templateUrl: './tournament-countdown.component.html',
  styleUrls: ['./tournament-countdown.component.scss']
})
export class TournamentCountdownComponent implements OnChanges, OnInit {

  @Select(GameState.isBoardFlipped) boardIsFlipped$: Observable<boolean>;
  @Input() timer: number;
  @Input() text  = null;
  @Input() isAction = false;
  @Output() action = new EventEmitter<void>();

  _timer: number;

  duration$ = new BehaviorSubject<number>(moment.duration(0, 'seconds').asMilliseconds());

  destroy$ = new Subject();

  durationFormat: moment.DurationFormatSettings = {
    trim: false,
    usePlural: false,
    useSignificantDigits: true
  };

  countdown$ = interval(1000).pipe(
    map(() => this._timer--),
    takeUntil(this.destroy$)
  );

  ngOnInit(): void {
    this.countdown$.subscribe((__timer) => {
      if (__timer >= 0) {
        this.duration$.next(
          moment.duration(__timer, 'seconds').asMilliseconds()
        );
      }
    });
  }

  event() {
    this.action.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['timer']) {
      let duration = moment.duration(0, 'seconds').asMilliseconds();
      if (changes['timer'].currentValue > 0) {
        this._timer = changes['timer'].currentValue;
        duration = moment.duration(changes['timer'].currentValue, 'seconds').asMilliseconds();
      }
      this.duration$.next(duration);
    }
  }
}
