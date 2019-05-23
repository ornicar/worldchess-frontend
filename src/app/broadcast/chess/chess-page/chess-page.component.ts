import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {  distinctUntilChanged, filter, map, pairwise, shareReplay, startWith, switchMap, mergeMap } from 'rxjs/operators';
import {
  BoardNotificationSocketAction,
  ISocketBoardNewMove,
  SocketType,
  IProfile,
  ISocketMessage,
  ISocketSendMessage,
} from '../../../auth/auth.model';
import { selectIsAuthorized, selectProfile } from '../../../auth/auth.reducer';
import { SocketConnectionService } from '../../../auth/socket-connection.service';
import { INotification } from '../../../board/board-socket/board-socket.model';
import { BoardSocketService } from '../../../board/board-socket/board-socket.service';
import { UserPurchasesService } from '../../../purchases/user-purchases/user-purchases.service';
import { OnChangesInputObservable, OnChangesObservable } from '../../../shared/decorators/observable-input';
import { SubscriptionHelper, Subscriptions } from '../../../shared/helpers/subscription.helper';
import { ScreenStateService } from '../../../shared/screen/screen-state.service';
import { UpdateBoard } from '../../core/board/board.actions';
import { IBoard } from '../../core/board/board.model';
import * as fromBoard from '../../core/board/board.reducer';
import { AddNotification } from '../../core/boardNotification/board-notification.actions';
import { ITour } from '../../core/tour/tour.model';
import { Tournament, BroadcastType, TournamentType } from '../../core/tournament/tournament.model';
import { AddMoves, DeleteMoves, GetMovesByBoard, UpdateMoves, UpsertMove } from '../../move/move.actions';
import { DeactivateVariationMoves } from '../../variation-move/variation-move.actions';
import { IGameState } from './game/game.model';
import { selectGameState } from './game/game.selectors';

@Component({
  selector: 'wc-chess-page',
  templateUrl: './chess-page.component.html',
  styleUrls: ['./chess-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessPageComponent implements OnInit, OnChanges, OnDestroy {
  @Input() board?: IBoard = null;

  @OnChangesInputObservable() board$ = new BehaviorSubject<IBoard>(this.board);

  @Input() tournament?: Tournament = null;

  @OnChangesInputObservable() tournament$ = new BehaviorSubject<Tournament>(this.tournament);

  @Input() tour?: ITour;

  @OnChangesInputObservable()
  tour$ = new BehaviorSubject<ITour>(this.tour);

  @Input()
  withoutBoard: boolean;

  protected subs: Subscriptions = {};
  boardInCenter = true;
  swapButtonAvailable = false;

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized)
  );

  profile$ = this.store$.pipe(
    select(selectProfile)
  );

  isPremium$ = this.tournament$.pipe(
    switchMap((tournament) => {
      if (!tournament) {
        return of(false);
      }

      if (tournament.broadcast_type === BroadcastType.FREE) {
        return of(true);
      }

      if (tournament.broadcast_type === BroadcastType.PAY) {
        return this.profile$.pipe(
          mergeMap((profile: IProfile) => (!!profile && profile.premium) || (!!profile && !!profile.is_admin) ? of(true) : this.userPurchases.hasUserTournament(tournament))
        );
      }

      if (tournament.broadcast_type === BroadcastType.ONLY_TICKET) {
        return this.userPurchases.hasUserTournament(tournament);
      }
    })
  );
  // @TODO_PURCHASES rework ALL 'isPremium' uses in whole application
  // @TODO_PURCHASES change product and plan in modal, use from 'sellings, main'

  private selectGameState = selectGameState();

  gameState$: Observable<IGameState> = this.board$.pipe(
    switchMap(board => this.store$.pipe(
        select(this.selectGameState, { boardId: board ? board.id : null })
      )
    ),
    shareReplay(1)
  );

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected store$: Store<fromBoard.State>,
    private screenService: ScreenStateService,
    private cd: ChangeDetectorRef,
    private boardSocketService: BoardSocketService,
    private socketService: SocketConnectionService<ISocketMessage, ISocketSendMessage>,
    private screenState: ScreenStateService,
    private userPurchases: UserPurchasesService
  ) {
  }

  onResize(matches: MediaQueryList['matches']) {
    if (matches) {
      this.boardInCenter = true;
      this.screenService.unlock();
      this.cd.markForCheck();
    } else {
      this.boardInCenter = true;
      this.cd.markForCheck();
    }
  }

  ngOnInit() {
    if (this.tournament && this.tournament.tournament_type === TournamentType.MATCH && this.tour) {
      this.store$.pipe(
        select(fromBoard.selectBoardsFromTour(), { tourId: this.tour.id }),
        map((boards: IBoard[]) => boards[0]),
        distinctUntilChanged(),
      ).subscribe(board => this.board$.next(board));
    }
    this.subs.onMatchMobile = this.screenState.matchMediaMobile$
      .subscribe(matches => this.onResize(matches));

    this.cd.markForCheck();

    this.subs.isAuthorized = this.isAuthorized$.subscribe(isAuthorized => {
      if (!isAuthorized) {
        this.boardInCenter = true;
        this.cd.markForCheck();
      }
    });
    this.subs.isPremium = this.isPremium$.subscribe(isPremium => {
      this.swapButtonAvailable = isPremium;
      this.cd.markForCheck();
    });

    this.subs.updateBoard = this.board$
      .pipe(
        map(board => board && board.id),
        filter(boardId => Boolean(boardId)),
        distinctUntilChanged()
      )
      .subscribe(boardId => {
        this.store$.dispatch(new GetMovesByBoard({ board_id: boardId }));
      });

    // @todo move my game.
    this.subs.DeactivateVariationMoves = this.board$
      .pipe(
        map(board => board && board.id),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.store$.dispatch(new DeactivateVariationMoves());
      });

    this.subs.subscribeToBoard = this.gameState$
        .pipe(
          map(state => state && state.board),
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
          }

          if (prev) {
            this.boardSocketService.unsubscribeFromBoard(prev.id);
          }
        });

    const isMoveMessage = message => [
      BoardNotificationSocketAction.MOVE_ESTIMATING,
      BoardNotificationSocketAction.MOVE_ADD,
      BoardNotificationSocketAction.MOVE_REPLACE
    ]
      .includes(message.action);

    this.subs.socketMoves = this.socketService.messages$
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
        });

    this.subs.newMove = this.socketService.messages$
      .pipe(filter(message =>
        message.action === BoardNotificationSocketAction.NEW_MOVE
        && message.message_type === SocketType.BOARD_NOTIFICATION
      ))
      .subscribe(({move}: ISocketBoardNewMove) => {
        this.store$.dispatch(new UpsertMove({move}));
      });

    this.subs.updateBoardSockets = this.socketService.messages$
        .pipe(filter(message => message.action === BoardNotificationSocketAction.BOARD_CHANGE))
        .subscribe( (message: any) => {
          const board = {
            id: message.board_id,
            changes: { ...message.board }
          };

          this.store$.dispatch(new UpdateBoard({board}));
        });

    this.subs.Notification = this.socketService.messages$
        .pipe(filter(message => message.action === BoardNotificationSocketAction.NOTIFICATION))
        .subscribe( (message: INotification) => {
          this.store$.dispatch(new AddNotification({
            notification: {
              board_id: message.board_id,
              message: message.message,
            }
          }));
        });
  }

  @OnChangesObservable()
  ngOnChanges() {
  }

  ngOnDestroy(): void {
    if (this.board) {
      this.boardSocketService.unsubscribeFromBoard(this.board.id);
    }

    SubscriptionHelper.unsubscribe(this.subs);
    this.screenService.unlock();
  }

  toggleLivestreamBoard(boardInCenter?: boolean) {
    if (typeof boardInCenter !== 'undefined') {
      this.boardInCenter = !!boardInCenter;
    } else {
      this.boardInCenter = !this.boardInCenter;
    }
    this.cd.markForCheck();
  }
}
