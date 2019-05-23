import {Component, Input, OnChanges, OnDestroy} from '@angular/core';
import {BehaviorSubject, merge, Observable, of, timer} from 'rxjs';
import {createSelector, select, Store} from '@ngrx/store';
import {selectBoardLastNotification} from '../../../../core/board/board.reducer';
import * as fromBoard from '../../../../core/board/board.reducer';
import {selectBoardNotification} from '../../../../core/boardNotification/board-notification.reducer';
import {BoardStatus, BoardResult} from '../../../../core/board/board.model';
import {selectTour} from '../../../../core/tour/tour.reducer';
import {IGameState} from '../../game/game.model';
import {OnChangesInputObservable, OnChangesObservable} from '../../../../../shared/decorators/observable-input';
import * as moment from 'moment';
import {distinctUntilChanged, map, mapTo, shareReplay, switchMap} from 'rxjs/operators';
import {ITour} from '../../../../core/tour/tour.model';
import {SubscriptionHelper} from '../../../../../shared/helpers/subscription.helper';
import {Subscription} from 'rxjs/internal/Subscription';
import {ChessPageSelectorsService} from '../../chess-page-selectors.service';
import {IMove} from '../../../../move/move.model';

@Component({
  selector: 'wc-chess-board-title',
  templateUrl: './chess-board-title.component.html',
  styleUrls: ['./chess-board-title.component.scss']
})
export class ChessBoardTitleComponent implements OnChanges, OnDestroy {
  @Input() gameState: IGameState;

  @Input()
  withoutBoard: boolean;

  @OnChangesInputObservable()
  gameState$ = new BehaviorSubject<IGameState>(this.gameState);

  private selectTourById = selectTour();

  board$ = this.gameState$.pipe(map(g => g.board));

  tour$: Observable<ITour> = this.board$.pipe(
    switchMap((board) => board && board.tour
      ? this.store$.pipe(
        select(this.selectTourById, {tourId: board.tour})
      )
      : of(null)
    ),
    shareReplay(1)
  );

  boardStatus$: Observable<BoardStatus> = this.board$.pipe(
    switchMap((board) => {
      if (!board) {
        return of(null);
      } else if (board.status !== BoardStatus.EXPECTED) {
        return of(board.status);
      } else {
        return this.tour$.pipe(
          switchMap(tour => {
            if (tour) {
              // Hide timer when date is outdated.
              const duration = moment(tour.datetime_of_round).diff(moment());

              return duration > 0
                ? merge(of(BoardStatus.EXPECTED), timer(duration).pipe(mapTo(BoardStatus.GOES)))
                : of(BoardStatus.GOES);
            } else {
              return of(BoardStatus.EXPECTED);
            }
          })
        );
      }
    }),
    distinctUntilChanged()
  );

  stockfishMessage$ = this.gameState$.pipe(
    switchMap(({board}) => this.chessPageSelectorsService.selectBoardMoves$(of(board))),
    map((moves: IMove[]) => {
      if (!moves.length) {
        return null;
      }
      const lastMove = moves[moves.length - 1];
      if (Math.abs(lastMove.stockfish_score) < 0.5) {
        return 'Position is even';
      }
      let message = (lastMove.stockfish_score < 0) ? 'Black ' : 'White ';
      if (Math.abs(lastMove.stockfish_score) < 1.5) {
        message += 'has a slight edge';
      } else {
        message += 'is winning';
      }

      return message;
    })
  );

  private selectNotifications = createSelector(
    selectBoardLastNotification(),
    selectBoardNotification(),
    (lastNotification, notification) => notification ? notification.message : lastNotification
  );

  notification$: Observable<string> = this.gameState$.pipe(
    switchMap(({board}) => board
      ? this.store$.pipe(
        select(this.selectNotifications, { boardId: board.id })
      )
      : of(null)
    ),
    shareReplay(1)
  );


  BoardStatus = BoardStatus;
  BoardResult = BoardResult;

  private subs: {[key: string]: Subscription} = {};

  constructor(
    private store$: Store<fromBoard.State>,
    private chessPageSelectorsService: ChessPageSelectorsService
  ) {}

  @OnChangesObservable()
  ngOnChanges() {
  }

  ngOnDestroy(): void {
    SubscriptionHelper.unsubscribe(this.subs);
  }
}
