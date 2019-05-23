import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, ViewEncapsulation} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {debounceTime, map, shareReplay, switchMap, withLatestFrom} from 'rxjs/operators';
import * as forRoot from '../../../../reducers';
import {OnChangesInputObservable, OnChangesObservable} from '../../../../shared/decorators/observable-input';
import {DurationPipe} from '../../../../shared/pipes/duration.pipe';
import {IBoard} from '../../../core/board/board.model';
import {IMove} from '../../../move/move.model';
import * as fromMove from '../../../move/move.reducer';
import {IBaseMetric} from '../base-metrics/base-metrics.component';

interface MatchTimeInfo {
  matchDurationSecs: number;
  longestMoveSecs: number;
  averageMoveSecs: number;
}

@Component({
  selector: 'wc-match-time-info',
  templateUrl: './match-time-info.component.html',
  styleUrls: ['./match-time-info.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchTimeInfoComponent implements OnInit, OnChanges {

  @Input() board: IBoard;

  @OnChangesInputObservable()
  private board$ = new BehaviorSubject<IBoard>(this.board);

  private selectBoardMoves = fromMove.selectBoardMoves();

  private moves$ = this.board$.pipe(
    switchMap(board => board
      ? this.store$.pipe(
        select(this.selectBoardMoves, { boardId: board.id })
      )
      : of([])
    ),
    debounceTime(10), // @todo fix. ExpressionChangedAfterItHasBeenCheckedError
    shareReplay(1),
  );

  public metrics$: Observable<IBaseMetric[]>;

  constructor(
    private store$: Store<forRoot.State>,
    private durationPipe: DurationPipe
  ) {}

  ngOnInit() {
    const matchTimeInfo = (moves: IMove[]) => {
        const info: MatchTimeInfo = {
          matchDurationSecs: 0,
          longestMoveSecs: 0,
          averageMoveSecs: 0
        };
        moves.forEach((move) => {
          const spentSeconds = move.seconds_spent || 0;

          info.matchDurationSecs += spentSeconds;
          info.longestMoveSecs = info.longestMoveSecs > spentSeconds ? info.longestMoveSecs : spentSeconds;
        });
        info.averageMoveSecs = Math.round(info.matchDurationSecs / moves.length);

        return info;
      };

    const defaultMetricsArray$: Observable<IBaseMetric[]> = of([
      {
        title: 'Game duration',
        value: '...'
      },
      {
        title: 'The longest move time',
        value: '...'
      },
      {
        title: 'Average move time',
        value: '...'
      }
    ]);

    this.metrics$ = this.moves$.pipe(
      withLatestFrom(defaultMetricsArray$),
      map(([moves, metrics]) => {
        if (moves.length) {
          const { matchDurationSecs, longestMoveSecs, averageMoveSecs } = matchTimeInfo(moves);

          metrics[0] = {
            title: metrics[0].title,
            value: this.durationPipe.transform(matchDurationSecs * 1000, 'HH:mm:ss', {trim: false})
          };

          metrics[1] = {
            title: metrics[1].title,
            value: this.durationPipe.transform(longestMoveSecs * 1000, 'hh[h]mm[m]ss[s]')
          };

          metrics[2] = {
            title: metrics[2].title,
            value: this.durationPipe.transform(averageMoveSecs * 1000, 'hh[h]mm[m]ss[s]')
          };

          metrics = [...metrics];
        }

        return metrics;
      })
    );
  }

  @OnChangesObservable()
  ngOnChanges(): void {
  }
}
