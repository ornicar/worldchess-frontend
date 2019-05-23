import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, OnChanges } from '@angular/core';
import {SocketConnectionService} from '../../../../app/auth/socket-connection.service';
import {BoardNotificationSocketAction, ISocketMessage, ISocketSendMessage} from '../../../../app/auth/auth.model';
import {BoardSocketService} from '../../../../app/board/board-socket/board-socket.service';
import {ChessBoardViewMode} from '../../../../app/broadcast/chess/chess-page/chess-board/chess-board.component';
import {selectGameState} from '../../../../app/broadcast/chess/chess-page/game/game.selectors';
import {WidgetLifeCycleService} from '../../services/widget-life-cycle.service';
import { IWidget } from '../../services/widget.service';
import {
  switchMap,
  startWith,
  pairwise,
  filter,
  map,
  take,
  distinctUntilChanged,
  pluck
} from 'rxjs/operators';
import {Subscription, of, Observable, ReplaySubject} from 'rxjs';
import { BoardStatus, IBoard } from '../../../../app/broadcast/core/board/board.model';

import * as fromRoot from '../../../../app/reducers/index';
import { UpdateBoard } from '../../../../app/broadcast/core/board/board.actions';
import { AddMoves, DeleteMoves, UpdateMoves, GetMovesByBoard } from '../../../../app/broadcast/move/move.actions';
import { Store, select } from '@ngrx/store';
import { IGameState } from '../../../../app/broadcast/chess/chess-page/game/game.model';
import { ViewEncapsulation } from '@angular/core';
import { ITour } from '../../../../app/broadcast/core/tour/tour.model';
import * as fromTour from '../../../../app/broadcast/core/tour/tour.reducer';
import * as fromTournament from '../../../../app/broadcast/core/tournament/tournament.reducer';
import { Tournament, TournamentStatus } from '../../../../app/broadcast/core/tournament/tournament.model';
import { GetCountries } from '../../../../app/broadcast/core/country/country.actions';
import { ChangeDetectionStrategy } from '@angular/core';
import { OnChangesInputObservable, OnChangesObservable } from '../../../../app/shared/decorators/observable-input';

export enum WidgetStatus {
  WAIT = 1,
  LIVE = 2,
  END = 3
}

@Component({
  selector: 'wc-widget-board',
  templateUrl: './widget-board.component.html',
  styleUrls: ['./widget-board.component.scss'],
  encapsulation: ViewEncapsulation.None, // TODO renmove this and check that it works
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetBoardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() forMainPage = false;

  @Input() widget: IWidget;

  @OnChangesInputObservable()
  public widget$ = new ReplaySubject<IWidget>(1);

  private selectTournament = fromTournament.selectTournament();
  private selectTour = fromTour.selectTour();
  private selectedGameState = selectGameState();

  public tournament$: Observable<Tournament> = this.widget$.pipe(
    map((widget: IWidget) => widget.tournament),
    switchMap(id => this.store$.pipe(
      select(this.selectTournament, { tournamentId: id })
      )
    )
  );

  public tour$: Observable<ITour> = this.widget$.pipe(
    map((widget: IWidget) => widget.tour),
    switchMap((tourId) => this.store$.pipe(
      select(this.selectTour, { tourId })
    ))
  );

  public gameState$ = this.widget$.pipe(
    map((widget: IWidget) => widget.board),
    switchMap(boardId => this.store$.pipe(
      select(this.selectedGameState, { boardId })
    ))
  );

  private subs: Subscription[] = [];

  public isDefaultsChosen = false;

  public widgetStatus = WidgetStatus;

  public widgetStatus$: Observable<WidgetStatus> = this.gameState$.pipe(
    pluck<IGameState, IBoard>('board'),
    switchMap((board) => {
      if (!board) {
        return of(null);
      } else if (board.status === BoardStatus.GOES) {
        return of(WidgetStatus.LIVE);
      } else if (board.status === BoardStatus.EXPECTED) {
        return of(WidgetStatus.WAIT);
      } else {
        return this.tournament$
          .pipe(
            map(tournament => {
              if (tournament && tournament.status === TournamentStatus.COMPLETED) {
                return WidgetStatus.END;
              } else {
                return WidgetStatus.WAIT;
              }
            })
          );
      }
    })
  );

  ChessBoardViewMode = ChessBoardViewMode;

  constructor(
    private socketService: SocketConnectionService<ISocketMessage, ISocketSendMessage>,
    private boardSocketService: BoardSocketService,
    private store$: Store<fromRoot.State>,
    private widgetLifeCycle: WidgetLifeCycleService,
    private cd: ChangeDetectorRef
  ) {
    this.store$.dispatch(new GetCountries());

    this.subs.push(
      this.gameState$.pipe(
          pluck<IGameState, IBoard>('board'),
          filter(board => Boolean(board)),
          pluck<IBoard, IBoard['id']>('id'),
          distinctUntilChanged()
        ).subscribe(id => {
          // this.store$.dispatch(new UpdateBoardState({ id }));
          this.store$.dispatch(new GetMovesByBoard({ board_id: id }));
        })
    );

    this.subs.push(
      this.gameState$.pipe(
        pluck<IGameState, IBoard>('board'),
        startWith(null),
        pairwise()
      )
        .subscribe(([prev, next]) => {
          const prevId = prev ? prev.id : null;
          const nextId = next ? next.id : null;

          if (prevId === nextId) {
            // @todo move to distinctUntilChanged.
            return;
          }

          if (next) {
            this.boardSocketService.subscribeToBoard(next.id);
            if (next.status === BoardStatus.COMPLETED) {
              if (this.isDefaultsChosen) {
                // @TODO don't use flag, check e.g. tournament status
                // or check that default === current
                this.isDefaultsChosen = false;
                this.widgetLifeCycle.complete(this.widget);
              } else {
                this.isDefaultsChosen = true;
                this.widgetLifeCycle.chooseNextGame(this.widget);
              }
            }
          }

          if (prev) {
            this.boardSocketService.unsubscribeFromBoard(prev.id);
          }
        })
    );

    const isMoveMessage = message => [
      BoardNotificationSocketAction.MOVE_ESTIMATING,
      BoardNotificationSocketAction.MOVE_ADD,
      BoardNotificationSocketAction.MOVE_REPLACE
    ]
      .includes(message.action);

    this.subs.push(
      this.socketService.messages$
        .pipe(filter(isMoveMessage))
        .subscribe(message => {

          switch (message.action) {
            case BoardNotificationSocketAction.MOVE_ADD: {
              this.store$.dispatch(new AddMoves({ moves: message.moves }));
              break;
            }

            case BoardNotificationSocketAction.MOVE_ESTIMATING: {
              const moves = message.moves
                .map(changes => ({
                  id: changes.id,
                  changes
                }));

              this.store$.dispatch(new UpdateMoves({ moves }));
              break;
            }

            case BoardNotificationSocketAction.MOVE_REPLACE: {
              this.store$.dispatch(new DeleteMoves({ ids: message.remove_moves_ids }));
              this.store$.dispatch(new AddMoves({ moves: message.moves }));
              break;
            }
          }
        })
    );

    this.subs.push(
      this.socketService.messages$
        .pipe(filter(message => message.action === BoardNotificationSocketAction.BOARD_CHANGE))
        .subscribe((message: any) => {
          const board = {
            id: message.board_id,
            changes: { ...message.board }
          };

          if (board.changes.status && board.changes.status === BoardStatus.COMPLETED) {
            this.widgetLifeCycle.chooseNextGame(this.widget);

            this.gameState$.pipe(
              pluck<IGameState, IBoard>('board'),
              take(1)
            ).subscribe(currentBoard => {
              if ((currentBoard && currentBoard.id) !== board.id) {
                this.boardSocketService.unsubscribeFromBoard(board.id);
              }
            });
          }

          this.store$.dispatch(new UpdateBoard( { board }));
        })
    );
  }

  ngOnInit() {
  }

  @OnChangesObservable()
  ngOnChanges() {
  }

  ngOnDestroy() {
    this.gameState$
      .pipe(
        pluck<IGameState, IBoard>('board'),
        take(1),
      )
      .subscribe(board => {
        if (board) {
          this.boardSocketService.unsubscribeFromBoard(board.id);
        }
      });

    this.subs.forEach(sub => sub.unsubscribe());
  }

}
