import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, ViewEncapsulation} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {distinctUntilChanged, map, shareReplay, switchMap, withLatestFrom} from 'rxjs/operators';
import * as forRoot from '../../../../reducers';
import {OnChangesInputObservable, OnChangesObservable} from '../../../../shared/decorators/observable-input';
import {DurationPipe} from '../../../../shared/pipes/duration.pipe';
import {BoardStatus, IBoard} from '../../../core/board/board.model';
import {selectBoardsFromTour} from '../../../core/board/board.reducer';
import {ITour} from '../../../core/tour/tour.model';
import {IMove} from '../../../move/move.model';
import {selectBoardsMoves} from '../../../move/move.reducer';
import {IBaseMetric} from '../base-metrics/base-metrics.component';

@Component({
  selector: 'wc-tour-metrics',
  templateUrl: './tour-metrics.component.html',
  styleUrls: ['./tour-metrics.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TourMetricsComponent implements OnInit, OnChanges {

  @Input() tour: ITour;

  @OnChangesInputObservable()
  private tour$ = new BehaviorSubject<ITour>(this.tour);

  private selectBoardsFromTour = selectBoardsFromTour();
  private selectBoardsMoves = selectBoardsMoves();

  private boards$: Observable<IBoard[]> = this.tour$.pipe(
    switchMap(tour => tour
      ? this.store$.pipe(
        select(this.selectBoardsFromTour, { tourId: tour.id })
      )
      : of([])
    ),
    shareReplay(1)
  );

  private moves$: Observable<IMove[]> = this.boards$.pipe(
    switchMap(boards => boards.length
      ? this.store$.pipe(
        select(this.selectBoardsMoves, { boardsIds: boards.map(({id}) => id) }),
      )
      : of([])
    ),
    shareReplay(1),
  );

  public metrics$: Observable<IBaseMetric[]>;

  constructor(
    private store$: Store<forRoot.State>,
    private durationPipe: DurationPipe
  ) {}

  ngOnInit() {
    const numberOfGames$: Observable<number> = this.boards$.pipe(
      map(boards => boards.length),
      distinctUntilChanged()
    );

    const activeGames$: Observable<number> = this.boards$.pipe(
      map(boards => boards.filter(b => b.status === BoardStatus.GOES).length),
      distinctUntilChanged()
    );

    const averageMoveTime$: Observable<number> = this.moves$.pipe(
      map(moves => Math.round(moves.reduce((spent, m) => spent + m.seconds_spent, 0) / moves.length)),
      distinctUntilChanged()
    );

    const defaultMetricsArray$: Observable<IBaseMetric[]> = of([
      {
        title: 'Number of games',
        value: '...'
      },
      {
        title: 'Active games',
        value: '...'
      },
      {
        title: 'Average move time',
        value: '...'
      }
    ]);

    this.metrics$ = this.boards$.pipe(
      withLatestFrom(defaultMetricsArray$),
      switchMap(([boards, metrics]) => {
        if (boards.length) {
          return combineLatest(
            numberOfGames$.pipe(
              map(numberOfGames => ({
                title: metrics[0].title,
                value: numberOfGames.toString()
              }))
            ),
            activeGames$.pipe(
              map(activeGames => ({
                title: metrics[1].title,
                value: activeGames.toString()
              }))
            ),
            averageMoveTime$.pipe(
              map(averageMoveTime => ({
                title: metrics[2].title,
                value: this.durationPipe.transform(averageMoveTime * 1000, 'hh[h]mm[m]ss[s]')
              }))
            ),
          );
        }

        return of(metrics);
      })
    );
  }

  @OnChangesObservable()
  ngOnChanges(): void {
  }
}
